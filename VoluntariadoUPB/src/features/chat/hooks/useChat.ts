import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { makeId } from '../utils/uuid';
import ChatApi from '../services/chatApi';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types/Message';

function isInScope(prompt: string) {
  // Basic client-side heuristic to ensure Plantini only answers app-related queries.
  const keywords = ['oportunidad', 'postula', 'postulación', 'perfil', 'permiso', 'roles', 'aplicación', 'aplicaciones', 'voluntari', 'inscripción', 'cuenta', 'login', 'registro'];
  const normalized = prompt.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
}

export function useChat(initialChatId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const store = useChatStore();

  const chatId = initialChatId ?? store.currentChatId ?? makeId();
  const api = useMemo(() => new ChatApi(chatId), [chatId]);

  // Persist the chatId to the store so it survives across sessions/navigation
  useEffect(() => {
    try {
      if (chatId) store.setCurrentChatId(chatId);
    } catch (e) {
      // ignore
    }
    // ensure we abort any inflight request when unmounting
    return () => {
      controllerRef.current?.abort();
    };
  }, [chatId]);

  const sendMessage = useCallback(
    async (content: string, files?: { uri: string; name?: string; type?: string }[]) => {
      if (!content?.trim() && !files?.length) return;

      // Check scope
      if (!isInScope(content)) {
        const msg: Message = {
          id: makeId(),
          content:
            'Lo siento — Plantini sólo puede responder consultas relacionadas con la app VoluntariadoUPB. Intenta preguntar sobre oportunidades, postulaciones, perfiles o permisos.',
          role: 'model',
          timestamp: Date.now(),
        };
        store.addMessage(chatId, msg);
        return;
      }

  const normalizedFiles = files?.map((f) => ({ name: f.name ?? 'image.jpg', uri: f.uri, type: f.type ?? 'image/jpeg', size: undefined }));
  const userMsg: Message = { id: makeId(), content, role: 'user', timestamp: Date.now(), files: normalizedFiles as any };
  store.addMessage(chatId, userMsg);

      setIsLoading(true);
      setIsWriting(true);
      controllerRef.current = new AbortController();
      let accumulated = '';

      // retry/backoff configuration
      const maxRetries = 2;
      const baseDelay = 700; // ms

      try {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            await api.sendMessageStream(
              content,
              files,
              controllerRef.current.signal,
              (chunk) => {
                // incremental updates
                accumulated += chunk;
                // update or upsert model placeholder
                const interim: Message = { id: 'plantini_placeholder', content: accumulated, role: 'model', timestamp: Date.now() };
                // Replace last model placeholder or append
                const existing = store.chats[chatId] ?? [];
                const idx = existing.findIndex((m) => m.id === 'plantini_placeholder');
                if (idx >= 0) {
                  const copy = [...existing];
                  copy[idx] = interim;
                  store.setMessages(chatId, copy);
                } else {
                  store.addMessage(chatId, interim);
                }
              }
            );

            // success -> break out of retry loop
            break;
          } catch (err: any) {
            // If aborted by user, rethrow to outer catch
            if (err?.name === 'AbortError') throw err;
            // network/other error -> attempt retry unless out of attempts
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(2, attempt);
              // small sleep
              await new Promise((res) => setTimeout(res, delay));
              continue;
            }
            // no more retries -> rethrow
            throw err;
          }
        }

        // finalize model message
        const final: Message = { id: makeId(), content: accumulated, role: 'model', timestamp: Date.now() };
        // remove placeholder and append final
        const current = store.chats[chatId] ?? [];
        const filtered = current.filter((m) => m.id !== 'plantini_placeholder');
        store.setMessages(chatId, [...filtered, final]);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // aborted by user
          const abortMsg: Message = { id: makeId(), content: 'Respuesta cancelada.', role: 'model', timestamp: Date.now() };
          store.addMessage(chatId, abortMsg);
        } else {
          setError(String(err?.message ?? 'Error al comunicarse con Plantini'));
          Alert.alert('Error', 'No se pudo conectar con Plantini. Puedes reintentar.');
        }
      } finally {
        setIsLoading(false);
        setIsWriting(false);
      }
    },
    [api, store, chatId]
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return {
    chatId,
    messages: store.chats[chatId] ?? [],
    isLoading,
    isWriting,
    error,
    sendMessage,
    cancel,
    setCurrentChatId: store.setCurrentChatId,
    clearChat: store.clearChat,
  };
}

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

  useEffect(() => {
    try {
      if (chatId) store.setCurrentChatId(chatId);
    } catch (e) {
      // ignore
    }
    return () => {
      controllerRef.current?.abort();
    };
  }, [chatId]);

  const sendMessage = useCallback(
    async (content: string, files?: { uri: string; name?: string; type?: string }[]) => {
      if (!content?.trim() && !files?.length) return;

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

      const maxRetries = 2;
      const baseDelay = 700; 

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
                const interim: Message = { id: 'plantini_placeholder', content: accumulated, role: 'model', timestamp: Date.now() };
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

            break;
          } catch (err: any) {
            if (err?.name === 'AbortError') throw err;
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(2, attempt);

              await new Promise((res) => setTimeout(res, delay));
              continue;
            }
            throw err;
          }
        }

        const final: Message = { id: makeId(), content: accumulated, role: 'model', timestamp: Date.now() };
        const current = store.chats[chatId] ?? [];
        const filtered = current.filter((m) => m.id !== 'plantini_placeholder');
        store.setMessages(chatId, [...filtered, final]);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
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

import { makeId } from '../utils/uuid';
import GEMINI_BASE_URL from '../../../config/gemini';

const BASE_URL = GEMINI_BASE_URL;

export type ChunkHandler = (chunk: string) => void;

export default class ChatApi {
  chatId: string;

  constructor(chatId?: string) {
    this.chatId = chatId ?? makeId();
  }

  async sendMessageStream(
    prompt: string,
    files?: { uri: string; name?: string; type?: string }[],
    signal?: AbortSignal,
    onChunk?: ChunkHandler
  ): Promise<void> {
    const url = `${BASE_URL}/gemini/chat-stream`;
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('chatId', this.chatId);

    if (files?.length) {
      files.forEach((f) => {
        form.append('files', {
          uri: f.uri,
          name: f.name ?? 'image.jpg',
          type: f.type ?? 'image/jpeg',
        } as any);
      });
    }

    const res = await fetch(url, {
      method: 'POST',
      body: form as any,
      signal,

    });


    if (res.body && res.body.getReader) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        if (onChunk) onChunk(chunk);
      }
    } else {
      const text = await res.text();
      if (onChunk) onChunk(text);
    }
  }

  async sendBasicPrompt(prompt: string, files?: { uri: string; name?: string; type?: string }[]) {
    const url = `${BASE_URL}/gemini/basic-prompt`;
    const form = new FormData();
    form.append('prompt', prompt);
    if (files?.length) {
      files.forEach((f) => form.append('files', { uri: f.uri, name: f.name ?? 'file', type: f.type ?? 'application/octet-stream' } as any));
    }
    const res = await fetch(url, { method: 'POST', body: form as any });
    return res.json();
  }
}

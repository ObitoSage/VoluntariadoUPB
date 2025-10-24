import { Injectable, Logger } from '@nestjs/common';
import { Content } from '@google/genai';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

const CHAT_STORAGE_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'storage',
  'chats',
);

@Injectable()
export class ChatHistoryRepository {
  private readonly logger = new Logger(ChatHistoryRepository.name);

  constructor() {
    void this.ensureStorageDirectory();
  }

  private async ensureStorageDirectory() {
    try {
      await fs.mkdir(CHAT_STORAGE_PATH, { recursive: true });
    } catch (error) {
      this.logger.error(
        'No se pudo crear el directorio para el historial de chats',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private getChatFilePath(chatId: string) {
    return path.join(CHAT_STORAGE_PATH, `${chatId}.json`);
  }

  async findByChatId(chatId: string): Promise<Content[]> {
    const filePath = this.getChatFilePath(chatId);

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const messages = JSON.parse(data) as Content[];
      return Array.isArray(messages) ? messages : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }

      this.logger.error(
        `No se pudo leer el historial del chat ${chatId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async save(chatId: string, messages: Content[]): Promise<void> {
    const filePath = this.getChatFilePath(chatId);

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf8');
    } catch (error) {
      this.logger.error(
        `No se pudo guardar el historial del chat ${chatId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async clear(chatId: string): Promise<void> {
    const filePath = this.getChatFilePath(chatId);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(
          `No se pudo eliminar el historial del chat ${chatId}`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      }
    }
  }
}

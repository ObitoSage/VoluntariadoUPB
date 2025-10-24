import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Content, GoogleGenAI } from '@google/genai';

import { BasicPromptDto } from './dtos/basic-prompt.dto';
import { basicPromptUseCase } from './use-cases/basic-prompt.use-case';
import { basicPromptStreamUseCase } from './use-cases/basic-prompt-stream.use-case';
import { ChatPromptDto } from './dtos/chat-prompt.dto';
import { chatPromptStreamUseCase } from './use-cases/chat-prompt-stream.use-case';
import { ImageGenerationDto } from './dtos/image-generation.dto';
import { imageGenerationUseCase } from './use-cases/image-generation.use-case';
import { getPokemonHelpUseCase } from './use-cases/get-pokemon-help.use-case';
import { TriviaQuestionDto } from './dtos/trivia-question.dto';
import { getTriviaQuestionUseCase } from './use-cases/get-trivia-question.use-case';
import { PokemonHelperDto } from './dtos/pokemon-helper.dto';
import { ChatHistoryRepository } from './repositories/chat-history.repository';

@Injectable()
export class GeminiService {
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(GeminiService.name);
  private readonly chatHistory = new Map<string, Content[]>();

  constructor(
    private readonly configService: ConfigService,
    private readonly chatHistoryRepository: ChatHistoryRepository,
  ) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');

    this.ai = new GoogleGenAI({ apiKey });
  }

  async basicPrompt(basicPromptDto: BasicPromptDto) {
    try {
      return await basicPromptUseCase(this.ai, basicPromptDto);
    } catch (error) {
      this.logger.error(
        'Error al procesar el prompt básico',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async basicPromptStream(basicPromptDto: BasicPromptDto) {
    try {
      return await basicPromptStreamUseCase(this.ai, basicPromptDto);
    } catch (error) {
      this.logger.error(
        'Error al procesar el prompt básico en streaming',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async chatStream(chatPromptDto: ChatPromptDto) {
    const chatHistory = await this.getChatHistory(chatPromptDto.chatId);
    try {
      return await chatPromptStreamUseCase(this.ai, chatPromptDto, {
        history: chatHistory,
      });
    } catch (error) {
      this.logger.error(
        'Error al procesar el chat en streaming',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async saveMessage(chatId: string, message: Content) {
    const messages = await this.getChatHistory(chatId);
    messages.push(message);
    this.chatHistory.set(chatId, messages);
    this.logger.debug(`Mensaje guardado para el chat ${chatId} (${message.role})`);

    try {
      await this.chatHistoryRepository.save(chatId, messages);
    } catch (error) {
      this.logger.error(
        `No se pudo persistir el historial del chat ${chatId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async getChatHistory(chatId: string) {
    this.logger.debug(`Obteniendo historial para el chat ${chatId}`);

    if (!this.chatHistory.has(chatId)) {
      try {
        const storedMessages = await this.chatHistoryRepository.findByChatId(chatId);
        this.chatHistory.set(chatId, storedMessages);
      } catch (error) {
        this.logger.error(
          `No se pudo cargar el historial del chat ${chatId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return structuredClone(this.chatHistory.get(chatId) ?? []);
  }

  async clearChatHistory(chatId: string) {
    this.logger.log(`Limpiando historial para el chat ${chatId}`);
    this.chatHistory.delete(chatId);

    try {
      await this.chatHistoryRepository.clear(chatId);
    } catch (error) {
      this.logger.error(
        `No se pudo limpiar el historial del chat ${chatId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async imageGeneration(imageGenerationDto: ImageGenerationDto) {
    const baseUrl = this.configService.get<string>('API_URL');
    try {
      return await imageGenerationUseCase(this.ai, imageGenerationDto, {
        baseUrl,
      });
    } catch (error) {
      this.logger.error(
        'Error al generar la imagen',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async getPokemonHelp(pokemonHelperDto: PokemonHelperDto) {
    try {
      return await getPokemonHelpUseCase(this.ai, pokemonHelperDto);
    } catch (error) {
      this.logger.error(
        'Error al obtener ayuda de Pokémon',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async getTriviaQuestion(triviaQuestionDto: TriviaQuestionDto) {
    try {
      return await getTriviaQuestionUseCase(this.ai, triviaQuestionDto);
    } catch (error) {
      this.logger.error(
        'Error al obtener la pregunta de trivia',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}

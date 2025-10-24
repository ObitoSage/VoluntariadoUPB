import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { ChatHistoryRepository } from './repositories/chat-history.repository';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService, ChatHistoryRepository],
})
export class GeminiModule {}

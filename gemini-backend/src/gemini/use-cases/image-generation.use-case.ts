import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  ContentListUnion,
  createPartFromUri,
  GoogleGenAI,
  Modality,
} from '@google/genai';
import { v4 as uuidV4 } from 'uuid';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { geminiUploadFiles } from '../helpers/gemini-upload-file';
import { ImageGenerationDto } from '../dtos/image-generation.dto';

const AI_IMAGES_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'public/ai-images',
);

const logger = new Logger('ImageGenerationUseCase');

const ensureAiImagesDirectory = () => {
  try {
    if (!fs.existsSync(AI_IMAGES_PATH)) {
      fs.mkdirSync(AI_IMAGES_PATH, { recursive: true });
    }
  } catch (error) {
    logger.error(
      'No se pudo crear el directorio para las imágenes generadas',
      error instanceof Error ? error.stack : String(error),
    );
    throw new InternalServerErrorException('No se pudo preparar el almacenamiento de imágenes');
  }
};

ensureAiImagesDirectory();

interface Options {
  model?: string;
  systemInstruction?: string;
  baseUrl?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  text: string;
}

export const imageGenerationUseCase = async (
  ai: GoogleGenAI,
  imageGenerationDto: ImageGenerationDto,
  options?: Options,
): Promise<ImageGenerationResponse> => {
  const { prompt, files = [] } = imageGenerationDto;
  const contents: ContentListUnion = [{ text: prompt }];

  const uploadedFiles = await geminiUploadFiles(ai, files, {
    transformToPng: true,
  });

  uploadedFiles.forEach((file) => {
    contents.push(createPartFromUri(file.uri ?? '', file.mimeType ?? ''));
  });

  const { model = 'gemini-2.0-flash-exp-image-generation', baseUrl } = options ?? {};

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  let imageUrl = '';
  let text = '';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const imageId = uuidV4();

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.text) {
      text = part.text;
      continue;
    }
    if (!part.inlineData) {
      continue;
    }

    const imageData = part.inlineData.data!;
    const buffer = Buffer.from(imageData, 'base64');
    const imagePath = path.join(AI_IMAGES_PATH, `${imageId}.png`);

    try {
      fs.writeFileSync(imagePath, buffer);
    } catch (error) {
      logger.error(
        'No se pudo guardar la imagen generada',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar la imagen generada');
    }

    const apiUrl = baseUrl ?? process.env.API_URL;
    if (!apiUrl) {
      logger.warn('API_URL no está configurado; no se puede generar la URL pública de la imagen');
    } else {
      imageUrl = `${apiUrl}/ai-images/${imageId}.png`;
    }
  }

  return {
    imageUrl: imageUrl,
    text: text,
  };
};

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { conversationHistory, conversations } from '@/db/schema';

// CONVERSATION SCHEMAS
export const conversationSchema = createSelectSchema(conversations, {
  startedAt: z.union([z.string(), z.date()]),
  lastUpdated: z.union([z.string(), z.date()]),
}).openapi('Conversation');

export const listConversationSchema = z.array(conversationSchema);

export const createConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  userId: true,
  startedAt: true,
  lastUpdated: true,
});

// CONVERSATION HISTORY SCHEMAS
export const conversationHistorySchema = createSelectSchema(
  conversationHistory,
  {
    timestamp: z.union([z.string(), z.date()]),
  },
).openapi('ConversationHistory');

export const listConversationHistorySchema = z.array(conversationHistorySchema);

export const createConversationHistorySchema = createInsertSchema(
  conversationHistory,
).omit({
  id: true,
  timestamp: true,
});

// MESSAGE SCHEMAS FOR API - Updated to support images
export const sendMessageSchema = z
  .object({
    message: z.string().min(1, 'Message cannot be empty'),
    image: z
      .string()
      .optional()
      .describe('Base64 encoded image data (optional)'),
  })
  .openapi('SendMessage');

export const chatResponseSchema = z
  .object({
    message: z.string(),
    conversationId: z.string(),
  })
  .openapi('ChatResponse');

// GENERATE CONTENT SCHEMAS
export const generateQuizSchema = z
  .object({
    topic: z
      .string()
      .optional()
      .describe(
        'Specific topic for the quiz (optional, will use conversation context if not provided)',
      ),
    questionCount: z
      .number()
      .min(1)
      .max(20)
      .default(5)
      .describe('Number of questions to generate'),
  })
  .openapi('GenerateQuiz');

export const generateFlashcardSchema = z
  .object({
    topic: z
      .string()
      .optional()
      .describe(
        'Specific topic for flashcards (optional, will use conversation context if not provided)',
      ),
    cardCount: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe('Number of flashcards to generate'),
  })
  .openapi('GenerateFlashcard');

export const generateVideoSchema = z
  .object({
    topic: z
      .string()
      .optional()
      .describe(
        'Specific topic for the video (optional, will use conversation context if not provided)',
      ),
    length: z
      .number()
      .min(1)
      .max(20)
      .default(5)
      .describe('Length of the video in minutes (optional, default 5)'),
  })
  .openapi('GenerateVideo');

export const quizGeneratedSchema = z
  .object({
    quizId: z.string(),
    title: z.string(),
    questionCount: z.number(),
  })
  .openapi('QuizGenerated');

export const flashcardGeneratedSchema = z
  .object({
    flashcardIds: z.array(z.string()),
    count: z.number(),
  })
  .openapi('FlashcardGenerated');

export const videoGeneratedSchema = z
  .object({
    videoId: z.string(),
    title: z.string(),
    videoUrl: z.string(),
    thumbnailUrl: z.string().optional(),
    duration: z.number().optional(),
  })
  .openapi('VideoGenerated');

// PARAMS SCHEMAS
export const conversationIdParamsSchema = z.object({ id: z.string() });

// TYPES
export type Conversation = z.infer<typeof conversationSchema>;
export type CreateConversation = z.infer<typeof createConversationSchema>;
export type ConversationHistory = z.infer<typeof conversationHistorySchema>;
export type CreateConversationHistory = z.infer<
  typeof createConversationHistorySchema
>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type GenerateQuiz = z.infer<typeof generateQuizSchema>;
export type GenerateFlashcard = z.infer<typeof generateFlashcardSchema>;
export type QuizGenerated = z.infer<typeof quizGeneratedSchema>;
export type FlashcardGenerated = z.infer<typeof flashcardGeneratedSchema>;
export type GenerateVideo = z.infer<typeof generateVideoSchema>;
export type VideoGenerated = z.infer<typeof videoGeneratedSchema>;

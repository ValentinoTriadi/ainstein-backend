import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { studyKits } from '@/db/schema';

import { quizSchema } from './quiz.type';
import { videoSchema } from './video.type';

// READ
export const studyKitSchema = createSelectSchema(studyKits, {
  createdAt: z.union([z.string(), z.date()]),
})
  .extend({
    videos: videoSchema.array().optional(),
    quizzes: quizSchema.array().optional(),
    flashcards: flashcardSchema.array().optional(),
  })
  .openapi('StudyKit');
export const listStudyKitSchema = z.array(studyKitSchema);

// CREATE
export const createStudyKitSchema = createInsertSchema(studyKits).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// UPDATE
export const updateStudyKitSchema = createStudyKitSchema.partial();

// PARAMS
export const studyKitIdParamsSchema = z.object({ id: z.string() });

// TYPES
export type StudyKit = z.infer<typeof studyKitSchema>;
export type CreateStudyKit = z.infer<typeof createStudyKitSchema>;
export type UpdateStudyKit = z.infer<typeof updateStudyKitSchema>;

// New: StudyKitWithLastMessage schema
export const lastMessageSchema = z
  .object({
    speaker: z.string(),
    messageText: z.string(),
    timestamp: z.union([z.string(), z.date()]),
  })
  .nullable();

export const studyKitWithLastMessageSchema = studyKitSchema.extend({
  imageUrl: z.string().url().nullable(),
  lastMessage: lastMessageSchema,
  conversationId: z.string(),
});

export const listStudyKitWithLastMessageSchema = z.array(
  studyKitWithLastMessageSchema,
);

export type StudyKitWithLastMessage = z.infer<
  typeof studyKitWithLastMessageSchema
>;

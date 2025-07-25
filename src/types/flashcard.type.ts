import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { flashcards } from '@/db/schema/flashcard.schema';

export const flashcardSchema =
  createSelectSchema(flashcards).openapi('Flashcard');
export const listFlashcardSchema = z.array(flashcardSchema);

export const createFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
  createdAt: true,
});

export const updateFlashcardSchema = createFlashcardSchema.partial().omit({
  studyKitId: true,
});

export const flashcardIdParamsSchema = z.object({ id: z.string() });

export type Flashcard = z.infer<typeof flashcardSchema>;
export type CreateFlashcard = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcard = z.infer<typeof updateFlashcardSchema>;

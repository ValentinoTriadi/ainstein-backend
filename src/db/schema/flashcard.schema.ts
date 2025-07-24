import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { createId } from '../db-helper';
import { studyKits } from './study-kit.schema';

// Flashcards
export const flashcards = pgTable('flashcards', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  studyKitId: varchar('study_kit_id')
    .notNull()
    .references(() => studyKits.id, { onDelete: 'cascade' }),
  frontText: text('front_text').notNull(),
  backText: text('back_text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  studyKit: one(studyKits, {
    fields: [flashcards.studyKitId],
    references: [studyKits.id],
  }),
}));

// Types
export type Flashcard = typeof flashcards.$inferSelect;
export type FlashcardInsert = typeof flashcards.$inferInsert;

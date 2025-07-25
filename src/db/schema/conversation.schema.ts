import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { createId } from '../db-helper';
import { flashcards } from './flashcard.schema';
import { quizzes } from './quiz.schema';
import { studyKits } from './study-kit.schema';
import { user } from './user.schema';
import { videos } from './video.schema';

// Conversations
export const conversations = pgTable('conversations', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  studyKitId: varchar('study_kit_id')
    .notNull()
    .references(() => studyKits.id, { onDelete: 'cascade' }),
  userId: varchar('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
});
export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    studyKit: one(studyKits, {
      fields: [conversations.studyKitId],
      references: [studyKits.id],
    }),
    user: one(user, {
      fields: [conversations.userId],
      references: [user.id],
    }),
    videos: many(videos),
    quizzes: many(quizzes),
    flashcards: many(flashcards),
  }),
);

// Conversation History
export const conversationHistory = pgTable('conversation_history', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  conversationId: varchar('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  speaker: varchar('speaker').notNull(),
  messageText: text('message_text').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});
export const conversationHistoryRelations = relations(
  conversationHistory,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationHistory.conversationId],
      references: [conversations.id],
    }),
  }),
);

// Types
export type Conversation = typeof conversations.$inferSelect;
export type ConversationInsert = typeof conversations.$inferInsert;
export type ConversationHistory = typeof conversationHistory.$inferSelect;
export type ConversationHistoryInsert = typeof conversationHistory.$inferInsert;

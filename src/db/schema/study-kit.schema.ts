import { relations } from 'drizzle-orm';
import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { createId } from '../db-helper';
import { flashcards } from './flashcard.schema';
import { quizzes } from './quiz.schema';
import { user } from './user.schema';
import { videos } from './video.schema';

// Study Kit Groups
export const studyKitGroups = pgTable('study_kit_groups', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  userId: varchar('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const studyKitGroupsRelations = relations(studyKitGroups, ({ one }) => ({
  user: one(user, {
    fields: [studyKitGroups.userId],
    references: [user.id],
  }),
}));

// Study Kits
export const studyKits = pgTable(
  'study_kits',
  {
    id: varchar('id').notNull().unique().$defaultFn(createId),
    groupId: varchar('group_id')
      .notNull()
      .references(() => studyKitGroups.id, { onDelete: 'cascade' }),
    userId: varchar('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: varchar('title').notNull(),
    description: text('description'),
    imageUrl: varchar('image_url', { length: 255 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.groupId] }),
  }),
);

export const studyKitsRelations = relations(studyKits, ({ one, many }) => ({
  group: one(studyKitGroups, {
    fields: [studyKits.groupId],
    references: [studyKitGroups.id],
  }),
  user: one(user, {
    fields: [studyKits.userId],
    references: [user.id],
  }),
  videos: many(videos),
  quizzes: many(quizzes),
  flashcards: many(flashcards),
}));

// Types
export type StudyKitGroup = typeof studyKitGroups.$inferSelect;
export type StudyKitGroupInsert = typeof studyKitGroups.$inferInsert;
export type StudyKit = typeof studyKits.$inferSelect;
export type StudyKitInsert = typeof studyKits.$inferInsert;

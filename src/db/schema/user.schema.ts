import { relations } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { createId } from '../db-helper';
import { conversations } from './conversation.schema';
import { studyKitGroups, studyKits } from './study-kit.schema';
import { videoLikes, videos, videosComments } from './video.schema';

export const user = pgTable('user', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  bio: text('bio'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userRelations = relations(user, ({ one }) => ({
  videos: one(videos, {
    fields: [user.id],
    references: [videos.userId],
  }),
  videoLikes: one(videoLikes, {
    fields: [user.id],
    references: [videoLikes.userId],
  }),
  videoComments: one(videosComments, {
    fields: [user.id],
    references: [videosComments.userId],
  }),
  studyKits: one(studyKits, {
    fields: [user.id],
    references: [studyKits.userId],
  }),
  studyKitGroups: one(studyKitGroups, {
    fields: [user.id],
    references: [studyKitGroups.userId],
  }),
  conversations: one(conversations, {
    fields: [user.id],
    references: [conversations.userId],
  }),
}));

// Types
export type User = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

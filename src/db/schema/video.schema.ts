import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

import { createId } from '../db-helper';
import { studyKits } from './study-kit.schema';
import { user } from './user.schema';

// Videos
export const videos = pgTable('videos', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  studyKitId: varchar('study_kit_id')
    .notNull()
    .references(() => studyKits.id, { onDelete: 'cascade' }),
  userId: varchar('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  url: varchar('url').notNull(),
  description: text('description'),
  like: integer('like').default(0),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

export const videosRelations = relations(videos, ({ one, many }) => ({
  studyKit: one(studyKits, {
    fields: [videos.studyKitId],
    references: [studyKits.id],
  }),
  user: one(user, {
    fields: [videos.userId],
    references: [user.id],
  }),
  likes: many(videoLikes),
  comments: many(videosComments),
}));

// Video Likes
export const videoLikes = pgTable(
  'video_likes',
  {
    videoId: varchar('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    userId: varchar('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    likedAt: timestamp('liked_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.videoId, table.userId] }),
    uniqueIdx: unique().on(table.videoId, table.userId),
  }),
);

export const videoLikesRelations = relations(videoLikes, ({ one }) => ({
  video: one(videos, {
    fields: [videoLikes.videoId],
    references: [videos.id],
  }),
  user: one(user, {
    fields: [videoLikes.userId],
    references: [user.id],
  }),
}));

// Video Comments
export const videosComments = pgTable('videos_comments', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  videoId: varchar('video_id')
    .notNull()
    .references(() => videos.id, { onDelete: 'cascade' }),
  userId: varchar('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  comment: varchar('comment').notNull(),
  createdAt: timestamp('liked_at').notNull().defaultNow(),
});

export const videosCommentsRelations = relations(videosComments, ({ one }) => ({
  video: one(videos, {
    fields: [videosComments.videoId],
    references: [videos.id],
  }),
  user: one(user, {
    fields: [videosComments.userId],
    references: [user.id],
  }),
}));

// Types
export type Video = typeof videos.$inferSelect;
export type VideoInsert = typeof videos.$inferInsert;
export type VideoLike = typeof videoLikes.$inferSelect;
export type VideoLikeInsert = typeof videoLikes.$inferInsert;
export type VideoComment = typeof videosComments.$inferSelect;
export type VideoCommentInsert = typeof videosComments.$inferInsert;

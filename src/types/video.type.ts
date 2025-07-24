import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { videoLikes, videos, videosComments } from '@/db/schema';

// READ
export const videoLikeSchema = createSelectSchema(videoLikes, {
  likedAt: z.union([z.string(), z.date()]),
}).openapi('VideoLike');
export const listVideoLikeSchema = z.array(videoLikeSchema);

export const VideoCommentSchema = createSelectSchema(videosComments, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('VideoComment');
export const listVideoCommentSchema = z.array(VideoCommentSchema);

export const videoSchema = createSelectSchema(videos, {
  uploadedAt: z.union([z.string(), z.date()]),
})
  .extend({
    likes: listVideoLikeSchema,
    comments: listVideoCommentSchema,
  })
  .openapi('Video');
export const listVideoSchema = z.array(videoSchema);

// CREATE
export const createVideoSchema = createInsertSchema(videos).omit({
  id: true,
  userId: true,
  uploadedAt: true,
});

export const createVideoLikeSchema = createInsertSchema(videoLikes).omit({
  userId: true,
  likedAt: true,
});

export const createVideoCommentSchema = createInsertSchema(videosComments).omit(
  {
    id: true,
    userId: true,
    createdAt: true,
  },
);

// UPDATE
export const updateVideoSchema = createVideoSchema.partial().omit({
  like: true,
  studyKitId: true,
});
export const updateVideoLikeSchema = createVideoLikeSchema.partial();
export const updateVideoCommentSchema = createVideoCommentSchema
  .partial()
  .omit({
    videoId: true,
  });

// PARAMS
export const videoIdParamsSchema = z.object({ videoId: z.string() });

// SEARCH
export const searchVideoQuerySchema = z.object({
  query: z.string().min(1).max(100).optional(),
});
export type SearchVideoQuery = z.infer<typeof searchVideoQuerySchema>;

// TYPES
export type Video = z.infer<typeof videoSchema>;
export type CreateVideo = z.infer<typeof createVideoSchema>;
export type UpdateVideo = z.infer<typeof updateVideoSchema>;
export type VideoLike = z.infer<typeof videoLikeSchema>;
export type CreateVideoLike = z.infer<typeof createVideoLikeSchema>;
export type UpdateVideoLike = z.infer<typeof updateVideoLikeSchema>;
export type VideoComment = z.infer<typeof VideoCommentSchema>;
export type CreateVideoComment = z.infer<typeof createVideoCommentSchema>;
export type UpdateVideoComment = z.infer<typeof updateVideoCommentSchema>;

import { and, eq, ilike, sql } from 'drizzle-orm';

import { first } from '@/db/db-helper';
import { Database } from '@/db/drizzle';
import { studyKits, videoLikes, videos, videosComments } from '@/db/schema';
import { SessionUser } from '@/types/session.type';
import {
  CreateVideo,
  CreateVideoComment,
  SearchVideoQuery,
  UpdateVideo,
  UpdateVideoComment,
} from '@/types/video.type';

export const createVideo = async (
  db: Database,
  body: CreateVideo,
  user: SessionUser,
) => {
  try {
    const { title, description, url, studyKitId } = body;
    const { id: userId } = user;

    const studyKitExists = await db.query.studyKits.findFirst({
      where: eq(studyKits.id, studyKitId),
    });
    if (!studyKitExists) {
      return {
        success: false,
        message: 'Study Kit not found',
        code: 404,
      };
    }

    await db.insert(videos).values({
      userId,
      title,
      description,
      url,
      like: 0,
      studyKitId,
    });

    // Fetch the created video to get its ID
    const createdVideo = await db.query.videos.findFirst({
      where: and(
        eq(videos.userId, userId),
        eq(videos.title, title),
        eq(videos.url, url),
      ),
      orderBy: [sql`${videos.uploadedAt} DESC`],
    });

    return {
      success: true,
      message: 'Video created successfully',
      code: 201,
      videoId: createdVideo?.id || null,
    };
  } catch (error) {
    console.error('Error creating Video:', error);
    return {
      success: false,
      message: 'Failed to create Video',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getListVideo = async (
  db: Database,
  user: SessionUser,
  query: SearchVideoQuery,
) => {
  try {
    let q = eq(videos.userId, user.id);
    if (query.query) {
      q = and(q, ilike(videos.title, `%${query.query}%`))!;
    }
    const video = await db.query.videos.findMany({
      where: q,
      with: {
        likes: true,
        comments: true,
      },
    });
    return {
      success: true,
      message: 'Video list fetched successfully',
      data: video,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching Video list:', error);
    return {
      success: false,
      message: 'Failed to fetch Video list',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getVideo = async (db: Database, id: string, user: SessionUser) => {
  try {
    const vid = await db.query.videos.findFirst({
      where: and(eq(videos.id, id), eq(videos.userId, user.id)),
      with: {
        likes: true,
        comments: true,
      },
    });

    if (!vid) {
      return {
        success: false,
        message: 'Video not found',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Video fetched successfully',
      data: vid,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching Video:', error);
    return {
      success: false,
      message: 'Failed to fetch Video',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const updateVideo = async (
  db: Database,
  id: string,
  body: UpdateVideo,
  user: SessionUser,
) => {
  try {
    const { title, description, url } = body;
    const { id: userId } = user;

    const result = await db
      .update(videos)
      .set({
        title,
        description,
        url,
      })
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Video not found or you do not have permission to edit it',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Video updated successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error updating Video:', error);
    return {
      success: false,
      message: 'Failed to update Video',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const deleteVideo = async (
  db: Database,
  id: string,
  user: SessionUser,
) => {
  try {
    const { id: userId } = user;

    const result = await db
      .delete(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Video not found or you do not have permission to delete it',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Video deleted successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error deleting Video:', error);
    return {
      success: false,
      message: 'Failed to delete Video',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const likeVideo = async (
  db: Database,
  videoId: string,
  user: SessionUser,
) => {
  try {
    const { id: userId } = user;

    const videoExists = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
    });

    if (!videoExists) {
      return {
        success: false,
        message: 'Video not found',
        code: 404,
      };
    }

    const result = await db.transaction(async (tx) => {
      const existingLike = await tx.query.videoLikes.findFirst({
        where: and(
          eq(videoLikes.videoId, videoId),
          eq(videoLikes.userId, userId),
        ),
      });

      if (existingLike) {
        return undefined; // No changes made, like already exists
      }

      await tx
        .update(videos)
        .set({ like: sql`${videos.like} + 1` })
        .where(eq(videos.id, videoId));

      return tx
        .insert(videoLikes)
        .values({ videoId, userId, likedAt: new Date() })
        .returning()
        .then(first);
    });

    if (!result) {
      return {
        success: false,
        message: 'Failed to like Video',
        code: 500,
      };
    }

    return {
      success: true,
      message: 'Video liked successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error liking Video:', error);
    return {
      success: false,
      message: 'Failed to like Video',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};
export const unlikeVideo = async (
  db: Database,
  videoId: string,
  user: SessionUser,
) => {
  try {
    const { id: userId } = user;

    const videoExists = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
    });

    if (!videoExists) {
      return {
        success: false,
        message: 'Video not found',
        code: 404,
      };
    }

    const result = await db.transaction(async (tx) => {
      const existingLike = await tx.query.videoLikes.findFirst({
        where: and(
          eq(videoLikes.videoId, videoId),
          eq(videoLikes.userId, userId),
        ),
      });

      if (!existingLike) {
        return undefined; // No changes made, like does not exist
      }

      await tx
        .update(videos)
        .set({ like: sql`${videos.like} - 1` })
        .where(eq(videos.id, videoId));

      return tx
        .delete(videoLikes)
        .where(
          and(eq(videoLikes.videoId, videoId), eq(videoLikes.userId, userId)),
        )
        .returning()
        .then(first);
    });

    console.log('result', result);

    if (!result) {
      return {
        success: false,
        message: 'Failed to unlike Video',
        code: 500,
      };
    }

    return {
      success: true,
      message: 'Video unliked successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error unliking Video:', error);
    return {
      success: false,
      message: 'Failed to unlike Video',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};
export const createVideoComment = async (
  db: Database,
  body: CreateVideoComment,
  user: SessionUser,
) => {
  try {
    const { videoId, comment } = body;
    const { id: userId } = user;

    const videoExists = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
    });

    if (!videoExists) {
      return {
        success: false,
        message: 'Video not found',
        code: 404,
      };
    }

    await db.insert(videosComments).values({
      videoId,
      userId,
      comment,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: 'Comment created successfully',
      code: 201,
    };
  } catch (error) {
    console.error('Error creating Video comment:', error);
    return {
      success: false,
      message: 'Failed to create Video comment',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};
export const editVideoComment = async (
  db: Database,
  id: string,
  body: UpdateVideoComment,
  user: SessionUser,
) => {
  try {
    const { id: userId } = user;
    const { comment } = body;

    const result = await db
      .update(videosComments)
      .set({ comment })
      .where(and(eq(videosComments.id, id), eq(videosComments.userId, userId)))
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Comment not found or you do not have permission to edit it',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Comment updated successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error updating Video comment:', error);
    return {
      success: false,
      message: 'Failed to update Video comment',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};
export const deleteVideoComment = async (
  db: Database,
  id: string,
  user: SessionUser,
) => {
  try {
    const { id: userId } = user;

    const result = await db
      .delete(videosComments)
      .where(and(eq(videosComments.id, id), eq(videosComments.userId, userId)))
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Comment not found or you do not have permission to delete it',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Comment deleted successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error deleting Video comment:', error);
    return {
      success: false,
      message: 'Failed to delete Video comment',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

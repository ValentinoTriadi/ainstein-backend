import { db } from '@/db/drizzle';
import { createAuthRouter } from '@/lib';
import {
  createVideo,
  createVideoComment,
  deleteVideo,
  deleteVideoComment,
  editVideoComment,
  getListVideo,
  getVideo,
  likeVideo,
  unlikeVideo,
  updateVideo,
} from '@/repositories/video.repository';
import {
  createVideoCommentRoute,
  createVideoRoute,
  deleteVideoCommentRoute,
  deleteVideoRoute,
  editVideoCommentRoute,
  getListVideoRoute,
  getVideoRoute,
  likeVideoRoute,
  unlikeVideoRoute,
  updateVideoRoute,
} from '@/routes/video.route';

export const videoProtectedRouter = createAuthRouter();

videoProtectedRouter.openapi(createVideoRoute, async (c) => {
  const body = c.req.valid('json');
  const res = await createVideo(db, body, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(getListVideoRoute, async (c) => {
  const query = c.req.valid('query');
  const res = await getListVideo(db, c.var.user, query);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(getVideoRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await getVideo(db, params.id, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(updateVideoRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const res = await updateVideo(db, params.id, body, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(deleteVideoRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await deleteVideo(db, params.id, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(likeVideoRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await likeVideo(db, params.videoId, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(unlikeVideoRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await unlikeVideo(db, params.videoId, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(createVideoCommentRoute, async (c) => {
  const res = await createVideoComment(db, c.req.valid('json'), c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(editVideoCommentRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const res = await editVideoComment(db, params.id, body, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

videoProtectedRouter.openapi(deleteVideoCommentRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await deleteVideoComment(db, params.id, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

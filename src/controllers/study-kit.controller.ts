import { db } from '@/db/drizzle';
import { createAuthRouter } from '@/lib';
import {
  createStudyKit,
  deleteStudyKit,
  getListStudyKit,
  getStudyKit,
  updateStudyKit,
} from '@/repositories/study-kit.repository';
import {
  createStudyKitRoute,
  deleteStudyKitRoute,
  getListStudyKitRoute,
  getStudyKitRoute,
  updateStudyKitRoute,
} from '@/routes/study-kit.route';

export const studyKitProtectedRouter = createAuthRouter();

studyKitProtectedRouter.openapi(createStudyKitRoute, async (c) => {
  const body = c.req.valid('json');
  const user = c.var.user;
  const res = await createStudyKit(db, body, user);
  return c.json(res, (res.code as unknown) ?? 201);
});

studyKitProtectedRouter.openapi(getListStudyKitRoute, async (c) => {
  const user = c.var.user;
  const res = await getListStudyKit(db, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

studyKitProtectedRouter.openapi(getStudyKitRoute, async (c) => {
  const params = c.req.valid('param');
  const user = c.var.user;
  const res = await getStudyKit(db, params.id, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

studyKitProtectedRouter.openapi(updateStudyKitRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const user = c.var.user;
  const res = await updateStudyKit(db, params.id, body, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

studyKitProtectedRouter.openapi(deleteStudyKitRoute, async (c) => {
  const params = c.req.valid('param');
  const user = c.var.user;
  const res = await deleteStudyKit(db, params.id, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

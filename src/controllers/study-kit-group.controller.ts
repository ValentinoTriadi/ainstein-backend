import { db } from '@/db/drizzle';
import { createAuthRouter } from '@/lib';
import {
  createStudyKitGroup,
  deleteStudyKitGroup,
  getListStudyKitGroup,
  getStudyKitGroup,
  updateStudyKitGroup,
} from '@/repositories/study-kit-group.repository';
import {
  createStudyKitGroupRoute,
  deleteStudyKitGroupRoute,
  getListStudyKitGroupRoute,
  getStudyKitGroupRoute,
  updateStudyKitGroupRoute,
} from '@/routes/study-kit-group.route';

export const studyKitGroupProtectedRouter = createAuthRouter();

studyKitGroupProtectedRouter.openapi(createStudyKitGroupRoute, async (c) => {
  const body = c.req.valid('json');
  const user = c.var.user;
  const res = await createStudyKitGroup(db, body, user);
  return c.json(res, (res.code as unknown) ?? 201);
});

studyKitGroupProtectedRouter.openapi(getListStudyKitGroupRoute, async (c) => {
  const user = c.var.user;
  const res = await getListStudyKitGroup(db, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

studyKitGroupProtectedRouter.openapi(getStudyKitGroupRoute, async (c) => {
  const params = c.req.valid('param');
  const user = c.var.user;
  const res = await getStudyKitGroup(db, params.id, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

studyKitGroupProtectedRouter.openapi(updateStudyKitGroupRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const user = c.var.user;
  const res = await updateStudyKitGroup(db, params.id, body, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

studyKitGroupProtectedRouter.openapi(deleteStudyKitGroupRoute, async (c) => {
  const params = c.req.valid('param');
  const user = c.var.user;
  const res = await deleteStudyKitGroup(db, params.id, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

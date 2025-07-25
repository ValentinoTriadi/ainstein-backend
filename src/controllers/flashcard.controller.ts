import { db } from '@/db/drizzle';
import { createAuthRouter } from '@/lib';
import {
  createFlashcard,
  deleteFlashcard,
  getFlashcard,
  getListFlashcard,
  updateFlashcard,
} from '@/repositories/flashcard.repository';
import {
  createFlashcardRoute,
  deleteFlashcardRoute,
  getFlashcardRoute,
  getListFlashcardRoute,
  updateFlashcardRoute,
} from '@/routes/flashcard.route';

export const flashcardProtectedRouter = createAuthRouter();

flashcardProtectedRouter.openapi(getListFlashcardRoute, async (c) => {
  const res = await getListFlashcard(db);
  return c.json(res, (res.code as unknown) ?? 200);
});

flashcardProtectedRouter.openapi(getFlashcardRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await getFlashcard(db, params.id);
  return c.json(res, (res.code as unknown) ?? 200);
});

flashcardProtectedRouter.openapi(createFlashcardRoute, async (c) => {
  const body = c.req.valid('json');
  const res = await createFlashcard(db, body);
  return c.json(res, (res.code as unknown) ?? 201);
});

flashcardProtectedRouter.openapi(updateFlashcardRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const res = await updateFlashcard(db, params.id, body);
  return c.json(res, (res.code as unknown) ?? 200);
});

flashcardProtectedRouter.openapi(deleteFlashcardRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await deleteFlashcard(db, params.id);
  return c.json(res, (res.code as unknown) ?? 200);
});

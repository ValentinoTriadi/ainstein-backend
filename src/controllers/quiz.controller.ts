import { db } from '@/db/drizzle';
import { createAuthRouter } from '@/lib';
import {
  createQuiz,
  deleteQuiz,
  deleteQuizAnswer,
  deleteQuizQuestion,
  getListQuiz,
  getQuiz,
  updateQuiz,
  updateQuizAnswer,
  updateQuizQuestion,
} from '@/repositories/quiz.repository';
import {
  createQuizRoute,
  deleteQuizAnswerRoute,
  deleteQuizQuestionRoute,
  deleteQuizRoute,
  getListQuizRoute,
  getQuizRoute,
  updateQuizAnswerRoute,
  updateQuizQuestionRoute,
  updateQuizRoute,
} from '@/routes/quiz.route';

export const quizProtectedRouter = createAuthRouter();

quizProtectedRouter.openapi(createQuizRoute, async (c) => {
  const body = c.req.valid('json');
  const res = await createQuiz(db, body);
  return c.json(res, (res.code as unknown) ?? 200);
});

quizProtectedRouter.openapi(getListQuizRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await getListQuiz(db, params.id, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

quizProtectedRouter.openapi(getQuizRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await getQuiz(db, params.id, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

quizProtectedRouter.openapi(updateQuizRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const res = await updateQuiz(db, params.id, body, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

quizProtectedRouter.openapi(deleteQuizRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await deleteQuiz(db, params.id, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

quizProtectedRouter.openapi(updateQuizQuestionRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const res = await updateQuizQuestion(db, params, body, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

quizProtectedRouter.openapi(deleteQuizQuestionRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await deleteQuizQuestion(db, params, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

quizProtectedRouter.openapi(updateQuizAnswerRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const res = await updateQuizAnswer(db, params, body, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

quizProtectedRouter.openapi(deleteQuizAnswerRoute, async (c) => {
  const params = c.req.valid('param');
  const res = await deleteQuizAnswer(db, params, c.var.user);
  return c.json(res, (res.code as unknown) ?? 200);
});

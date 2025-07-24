import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { quizAnswers, quizQuestions, quizzes } from '@/db/schema';

// READ
export const quizAnswerSchema =
  createSelectSchema(quizAnswers).openapi('QuizAnswer');
export const listQuizAnswerSchema = z.array(quizAnswerSchema);

export const quizQuestionSchema = createSelectSchema(quizQuestions)
  .extend({
    answers: listQuizAnswerSchema,
  })
  .openapi('QuizQuestion');
export const listQuizQuestionSchema = z.array(quizQuestionSchema);

export const quizSchema = createSelectSchema(quizzes, {
  createdAt: z.union([z.string(), z.date()]),
})
  .extend({
    questions: listQuizQuestionSchema,
  })
  .openapi('Quiz');
export const listQuizSchema = z.array(quizSchema);

// CREATE
export const createQuizAnswerSchema = createInsertSchema(quizAnswers).omit({
  questionId: true,
  id: true,
});
export const createQuizQuestionSchema = createInsertSchema(quizQuestions)
  .omit({
    quizId: true,
    id: true,
  })
  .extend({
    answers: z.array(createQuizAnswerSchema),
  });
export const createQuizSchema = createInsertSchema(quizzes)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    questions: z.array(createQuizQuestionSchema),
  });

// UPDATE
export const updateQuizSchema = createInsertSchema(quizzes).partial().omit({
  id: true,
  studyKitId: true,
  createdAt: true,
});
export const updateQuizQuestionSchema = createInsertSchema(quizQuestions)
  .partial()
  .omit({
    quizId: true,
    id: true,
  });
export const updateQuizAnswerSchema = createInsertSchema(quizAnswers)
  .partial()
  .omit({
    questionId: true,
    id: true,
  });

// PARAMS
export const quizIdParamsSchema = z.object({ quizId: z.string() });
export const quizQuestionIdParamsSchema = z.object({
  quizId: z.string(),
  questionId: z.string(),
});
export const quizAnswerIdParamsSchema = z.object({
  quizId: z.string(),
  questionId: z.string(),
  answerId: z.string(),
});

export type QuizQuestionIdParams = z.infer<typeof quizQuestionIdParamsSchema>;
export type QuizAnswerIdParams = z.infer<typeof quizAnswerIdParamsSchema>;

// TYPES
export type Quiz = z.infer<typeof quizSchema>;
export type CreateQuiz = z.infer<typeof createQuizSchema>;
export type UpdateQuiz = z.infer<typeof updateQuizSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type UpdateQuizQuestion = z.infer<typeof updateQuizQuestionSchema>;
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export type UpdateQuizAnswer = z.infer<typeof updateQuizAnswerSchema>;

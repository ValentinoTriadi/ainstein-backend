import { relations } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { createId } from '../db-helper';
import { studyKits } from './study-kit.schema';

// Quizzes
export const quizzes = pgTable('quizzes', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  studyKitId: varchar('study_kit_id')
    .notNull()
    .references(() => studyKits.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export const quizzesRelations = relations(quizzes, ({ one }) => ({
  studyKit: one(studyKits, {
    fields: [quizzes.studyKitId],
    references: [studyKits.id],
  }),
}));

// Quiz Questions
export const quizQuestions = pgTable('quiz_questions', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  quizId: varchar('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type').notNull(),
});
export const quizQuestionsRelations = relations(
  quizQuestions,
  ({ one, many }) => ({
    quiz: one(quizzes, {
      fields: [quizQuestions.quizId],
      references: [quizzes.id],
    }),
    quizAnswers: many(quizAnswers),
  }),
);

// Quiz Answers
export const quizAnswers = pgTable('quiz_answers', {
  id: varchar('id').primaryKey().unique().$defaultFn(createId),
  questionId: varchar('question_id')
    .notNull()
    .references(() => quizQuestions.id, { onDelete: 'cascade' }),
  answerText: text('answer_text').notNull(),
  isCorrect: boolean('is_correct').default(false),
});
export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  question: one(quizQuestions, {
    fields: [quizAnswers.questionId],
    references: [quizQuestions.id],
  }),
}));

// Types
export type Quiz = typeof quizzes.$inferSelect;
export type QuizInsert = typeof quizzes.$inferInsert;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizQuestionInsert = typeof quizQuestions.$inferInsert;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type QuizAnswerInsert = typeof quizAnswers.$inferInsert;

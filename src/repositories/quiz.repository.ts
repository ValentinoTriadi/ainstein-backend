import { and, eq } from 'drizzle-orm';
import { firstSure } from '@/db/db-helper';
import { Database } from '@/db/drizzle';
import { quizAnswers, quizQuestions, quizzes, studyKits } from '@/db/schema';
import {
  CreateQuiz,
  QuizAnswerIdParams,
  QuizQuestionIdParams,
  UpdateQuiz,
  UpdateQuizAnswer,
  UpdateQuizQuestion,
} from '@/types/quiz.type';
import { SessionUser } from '@/types/session.type';

// Types for AI-generated quiz creation
export interface QuizData {
  title: string;
  description?: string;
  questions: QuestionData[];
}

export interface QuestionData {
  questionText: string;
  questionType: string;
  answers: AnswerData[];
}

export interface AnswerData {
  answerText: string;
  isCorrect: boolean;
}

// AI-powered quiz creation
export const createQuizFromAI = async (
  db: Database,
  studyKitId: string,
  quizData: QuizData,
  user: SessionUser,
) => {
  try {
    const { id: userId } = user;
    const { title, description, questions } = quizData;

    return await db.transaction(async (tx) => {
      // Create the quiz
      const [newQuiz] = await tx
        .insert(quizzes)
        .values({
          studyKitId,
          title,
          description,
        })
        .returning();

      // Create questions and answers
      for (const questionData of questions) {
        const [newQuestion] = await tx
          .insert(quizQuestions)
          .values({
            quizId: newQuiz.id,
            questionText: questionData.questionText,
            questionType: questionData.questionType,
          })
          .returning();

        // Create answers for this question
        if (questionData.answers && questionData.answers.length > 0) {
          await tx.insert(quizAnswers).values(
            questionData.answers.map((answer) => ({
              questionId: newQuestion.id,
              answerText: answer.answerText,
              isCorrect: answer.isCorrect,
            }))
          );
        }
      }

      return {
        success: true,
        message: 'Quiz created successfully',
        data: {
          quizId: newQuiz.id,
          title: newQuiz.title,
          questionCount: questions.length,
        },
        code: 201,
      };
    });
  } catch (error) {
    console.error('Error creating AI-generated quiz:', error);
    return {
      success: false,
      message: 'Failed to create quiz',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

// CRUD logic for quizzes
export const createQuiz = async (db: Database, body: CreateQuiz) => {
  try {
    const { title, description, questions, studyKitId } = body;

    const studyKitExists = await db.query.studyKits.findFirst({
      where: eq(studyKits.id, body.studyKitId),
    });
    if (!studyKitExists) {
      return {
        success: false,
        message: 'Study Kit not found',
        code: 404,
      };
    }

    const result = await db.transaction(async (tx) => {
      const quiz = await tx
        .insert(quizzes)
        .values({
          title,
          description,
          studyKitId,
        })
        .returning()
        .then(firstSure);

      const quizId = quiz.id;

      const mappedQuestions = questions.map((question) => ({
        quizId,
        questionText: question.questionText,
        questionType: question.questionType,
      }));

      if (mappedQuestions.length === 0) {
        return {
          success: false,
          message: 'Quiz must have at least one question',
          code: 400,
        };
      }

      const insertedQuestions = await tx
        .insert(quizQuestions)
        .values(mappedQuestions)
        .returning();

      const questionIds = insertedQuestions.map((q) => q.id);

      const answers = questions.flatMap((question, index) =>
        question.answers.map((answer) => ({
          questionId: questionIds[index],
          answerText: answer.answerText,
          isCorrect: answer.isCorrect,
        })),
      );

      if (answers.length > 0) {
        await tx.insert(quizAnswers).values(answers);
      } else {
        return {
          success: false,
          message: 'Each Question must have at least one answer',
          code: 400,
        };
      }

      return {
        success: true,
        message: 'Quiz created successfully',
        data: quiz,
        code: 201,
      };
    });

    return result;
  } catch (error) {
    console.error('Error creating quiz:', error);
    return {
      success: false,
      message: 'Failed to create quiz',
      code: 500,
    };
  }
};

export const getListQuiz = async (
  db: Database,
  studyKitId: string,
  user: SessionUser,
) => {
  try {
    // check study kit ownership
    const studyKit = await db.query.studyKits.findFirst({
      where: and(eq(studyKits.id, studyKitId), eq(studyKits.userId, user.id)),
    });
    if (!studyKit) {
      return {
        success: false,
        message:
          'Study Kit not found or you do not have permission to access it',
        code: 404,
      };
    }

    const quizzesList = await db.query.quizzes.findMany({
      where: eq(quizzes.studyKitId, studyKitId),
      with: {
        quizQuestions: {
          with: {
            quizAnswers: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Quizzes fetched successfully',
      data: quizzesList,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return {
      success: false,
      message: 'Failed to fetch quizzes',
      code: 500,
    };
  }
};

export const getQuiz = async (db: Database, id: string, user: SessionUser) => {
  try {
    const quiz = await db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, id)),
      with: {
        studyKit: true,
        quizQuestions: {
          with: {
            quizAnswers: true,
          },
        },
      },
    });

    if (!quiz) {
      return {
        success: false,
        message: 'Quiz not found',
        code: 404,
      };
    }

    if (quiz.studyKit.userId !== user.id) {
      return {
        success: false,
        message: 'You do not have permission to access this quiz',
        code: 403,
      };
    }

    return {
      success: true,
      message: 'Quiz fetched successfully',
      data: quiz,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return {
      success: false,
      message: 'Failed to fetch quiz',
      code: 500,
    };
  }
};

export const updateQuiz = async (
  db: Database,
  id: string,
  body: UpdateQuiz,
  user: SessionUser,
) => {
  try {
    const { title, description } = body;

    const quiz = await db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, id)),
      with: {
        studyKit: true,
      },
    });

    if (!quiz) {
      return {
        success: false,
        message: 'Quiz not found',
        code: 404,
      };
    }

    if (quiz.studyKit.userId !== user.id) {
      return {
        success: false,
        message: 'You do not have permission to update this quiz',
        code: 403,
      };
    }

    const updatedQuiz = await db
      .update(quizzes)
      .set({ title, description })
      .where(eq(quizzes.id, id))
      .returning()
      .then(firstSure);

    return {
      success: true,
      message: 'Quiz updated successfully',
      data: updatedQuiz,
      code: 200,
    };
  } catch (error) {
    console.error('Error updating quiz:', error);
    return {
      success: false,
      message: 'Failed to update quiz',
      code: 500,
    };
  }
};

export const deleteQuiz = async (
  db: Database,
  id: string,
  user: SessionUser,
) => {
  try {
    const quiz = await db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, id)),
      with: {
        studyKit: true,
      },
    });

    if (!quiz) {
      return {
        success: false,
        message: 'Quiz not found',
        code: 404,
      };
    }

    if (quiz.studyKit.userId !== user.id) {
      return {
        success: false,
        message: 'You do not have permission to delete this quiz',
        code: 403,
      };
    }

    await db.delete(quizzes).where(eq(quizzes.id, id));

    return {
      success: true,
      message: 'Quiz deleted successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return {
      success: false,
      message: 'Failed to delete quiz',
      code: 500,
    };
  }
};

export const updateQuizQuestion = async (
  db: Database,
  params: QuizQuestionIdParams,
  body: UpdateQuizQuestion,
  user: SessionUser,
) => {
  try {
    const { questionId, quizId } = params;
    const { questionText, questionType } = body;

    const quiz = await db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, quizId)),
      with: {
        studyKit: true,
      },
    });

    if (!quiz) {
      return {
        success: false,
        message: 'Quiz not found',
        code: 404,
      };
    }

    if (quiz.studyKit.userId !== user.id) {
      return {
        success: false,
        message: 'You do not have permission to update this quiz question',
        code: 403,
      };
    }

    const question = await db.query.quizQuestions.findFirst({
      where: and(
        eq(quizQuestions.id, questionId),
        eq(quizQuestions.quizId, quizId),
      ),
    });

    if (!question) {
      return {
        success: false,
        message: 'Question not found',
        code: 404,
      };
    }

    await db
      .update(quizQuestions)
      .set({ questionText, questionType })
      .where(eq(quizQuestions.id, questionId));

    return {
      success: true,
      message: 'Quiz question updated successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error updating quiz question:', error);
    return {
      success: false,
      message: 'Failed to update quiz question',
      code: 500,
    };
  }
};

export const deleteQuizQuestion = async (
  db: Database,
  params: QuizQuestionIdParams,
  user: SessionUser,
) => {
  try {
    const { quizId, questionId } = params;

    const quiz = await db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, quizId)),
      with: {
        studyKit: true,
      },
    });

    if (!quiz) {
      return {
        success: false,
        message: 'Quiz not found',
        code: 404,
      };
    }

    if (quiz.studyKit.userId !== user.id) {
      return {
        success: false,
        message: 'You do not have permission to delete this quiz question',
        code: 403,
      };
    }

    const question = await db.query.quizQuestions.findFirst({
      where: and(
        eq(quizQuestions.id, questionId),
        eq(quizQuestions.quizId, quizId),
      ),
    });

    if (!question) {
      return {
        success: false,
        message: 'Question not found',
        code: 404,
      };
    }

    await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId));

    return {
      success: true,
      message: 'Quiz question deleted successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error deleting quiz question:', error);
    return {
      success: false,
      message: 'Failed to delete quiz question',
      code: 500,
    };
  }
};

export const updateQuizAnswer = async (
  db: Database,
  params: QuizAnswerIdParams,
  body: UpdateQuizAnswer,
  user: SessionUser,
) => {
  try {
    const { questionId, answerId } = params;
    const { answerText, isCorrect } = body;

    const question = await db.query.quizQuestions.findFirst({
      where: and(eq(quizQuestions.id, questionId)),
      with: {
        quiz: {
          with: {
            studyKit: true,
          },
        },
      },
    });

    if (!question) {
      return {
        success: false,
        message: 'Question not found',
        code: 404,
      };
    }

    if (question.quiz.studyKit.userId !== user.id) {
      return {
        success: false,
        message: 'You do not have permission to update this quiz answer',
        code: 403,
      };
    }

    const answer = await db.query.quizAnswers.findFirst({
      where: and(
        eq(quizAnswers.id, answerId),
        eq(quizAnswers.questionId, questionId),
      ),
    });

    if (!answer) {
      return {
        success: false,
        message: 'Answer not found',
        code: 404,
      };
    }

    await db
      .update(quizAnswers)
      .set({ answerText, isCorrect })
      .where(eq(quizAnswers.id, answerId));

    return {
      success: true,
      message: 'Quiz answer updated successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error updating quiz answer:', error);
    return {
      success: false,
      message: 'Failed to update quiz answer',
      code: 500,
    };
  }
};

export const deleteQuizAnswer = async (
  db: Database,
  params: QuizAnswerIdParams,
  user: SessionUser,
) => {
  try {
    const { questionId, answerId } = params;

    const question = await db.query.quizQuestions.findFirst({
      where: and(eq(quizQuestions.id, questionId)),
      with: {
        quiz: {
          with: {
            studyKit: true,
          },
        },
      },
    });

    if (!question) {
      return {
        success: false,
        message: 'Question not found',
        code: 404,
      };
    }

    if (question.quiz.studyKit.userId !== user.id) {
      return {
        success: false,
        message: 'You do not have permission to delete this quiz answer',
        code: 403,
      };
    }

    const answer = await db.query.quizAnswers.findFirst({
      where: and(
        eq(quizAnswers.id, answerId),
        eq(quizAnswers.questionId, questionId),
      ),
    });

    if (!answer) {
      return {
        success: false,
        message: 'Answer not found',
        code: 404,
      };
    }

    await db.delete(quizAnswers).where(eq(quizAnswers.id, answerId));

    // Optionally, you can check if the question still has answers left
    const remainingAnswers = await db.query.quizAnswers.findMany({
      where: eq(quizAnswers.questionId, questionId),
    });

    if (remainingAnswers.length === 0) {
      // Optionally delete the question if no answers left
      await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId));
    }

    return {
      success: true,
      message: 'Quiz answer deleted successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error deleting quiz answer:', error);
    return {
      success: false,
      message: 'Failed to delete quiz answer',
      code: 500,
    };
  }
};

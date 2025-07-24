import { createRoute, z } from '@hono/zod-openapi';

import { createResponseSchema } from '@/lib';
import { idParamsSchema } from '@/types/generic.type';
import {
  createQuizSchema,
  listQuizSchema,
  quizQuestionIdParamsSchema,
  quizSchema,
  updateQuizQuestionSchema,
  updateQuizSchema,
} from '@/types/quiz.type';

export const createQuizRoute = createRoute({
  operationId: 'createQuiz',
  tags: ['quiz'],
  method: 'post',
  path: '/quiz',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createQuizSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Create Quiz',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const getListQuizRoute = createRoute({
  operationId: 'getListQuiz',
  tags: ['quiz'],
  method: 'get',
  path: '/quiz',
  request: {},
  responses: {
    200: {
      description: 'List of All Quizzes',
      content: {
        'application/json': {
          schema: createResponseSchema(listQuizSchema),
        },
      },
    },
  },
});

export const getQuizRoute = createRoute({
  operationId: 'getQuiz',
  tags: ['quiz'],
  method: 'get',
  path: '/quiz/:id',
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Quiz By Id',
      content: {
        'application/json': {
          schema: createResponseSchema(quizSchema),
        },
      },
    },
  },
});

export const updateQuizRoute = createRoute({
  operationId: 'updateQuiz',
  tags: ['quiz'],
  method: 'put',
  path: '/quiz/:id',
  request: {
    params: idParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateQuizSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Update Quiz',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const deleteQuizRoute = createRoute({
  operationId: 'deleteQuiz',
  tags: ['quiz'],
  method: 'delete',
  path: '/quiz/:id',
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Delete Quiz',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const updateQuizQuestionRoute = createRoute({
  operationId: 'updateQuizQuestion',
  tags: ['quiz'],
  method: 'put',
  path: '/quiz/:quizId/question/:questionId',
  request: {
    params: z.object({
      quizId: z.string(),
      questionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateQuizQuestionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Update Quiz Question',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const deleteQuizQuestionRoute = createRoute({
  operationId: 'deleteQuizQuestion',
  tags: ['quiz'],
  method: 'delete',
  path: '/quiz/:quizId/question/:questionId',
  request: {
    params: quizQuestionIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Delete Quiz Question',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

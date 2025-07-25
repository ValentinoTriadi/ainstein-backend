import { createRoute } from '@hono/zod-openapi';

import { createResponseSchema } from '@/lib';
import {
  createFlashcardSchema,
  flashcardIdParamsSchema,
  flashcardSchema,
  listFlashcardSchema,
  updateFlashcardSchema,
} from '@/types/flashcard.type';

export const getListFlashcardRoute = createRoute({
  operationId: 'getListFlashcard',
  tags: ['flashcard'],
  method: 'get',
  path: '/flashcard',
  request: {},
  responses: {
    200: {
      description: 'List of flashcards',
      content: {
        'application/json': {
          schema: createResponseSchema(listFlashcardSchema),
        },
      },
    },
  },
});

export const getFlashcardRoute = createRoute({
  operationId: 'getFlashcard',
  tags: ['flashcard'],
  method: 'get',
  path: '/flashcard/:id',
  request: {
    params: flashcardIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Get flashcard by id',
      content: {
        'application/json': {
          schema: createResponseSchema(flashcardSchema),
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const createFlashcardRoute = createRoute({
  operationId: 'createFlashcard',
  tags: ['flashcard'],
  method: 'post',
  path: '/flashcard',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createFlashcardSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Flashcard created',
      content: {
        'application/json': {
          schema: createResponseSchema(flashcardSchema),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const updateFlashcardRoute = createRoute({
  operationId: 'updateFlashcard',
  tags: ['flashcard'],
  method: 'put',
  path: '/flashcard/:id',
  request: {
    params: flashcardIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateFlashcardSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Flashcard updated',
      content: {
        'application/json': {
          schema: createResponseSchema(flashcardSchema),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const deleteFlashcardRoute = createRoute({
  operationId: 'deleteFlashcard',
  tags: ['flashcard'],
  method: 'delete',
  path: '/flashcard/:id',
  request: {
    params: flashcardIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Flashcard deleted',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

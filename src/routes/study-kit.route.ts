import { createRoute } from '@hono/zod-openapi';

import { createResponseSchema } from '@/lib';
import { studyKitGroupIdParamsSchema } from '@/types/study-kit-group.type';
import {
  createStudyKitSchema,
  listStudyKitSchema,
  studyKitIdParamsSchema,
  studyKitSchema,
  updateStudyKitSchema,
  studyKitWithLastMessageSchema,
  listStudyKitWithLastMessageSchema,
} from '@/types/study-kit.type';

export const createStudyKitRoute = createRoute({
  operationId: 'createStudyKit',
  tags: ['study-kit'],
  method: 'post',
  path: '/study-kit',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createStudyKitSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Create Study Kit',
      content: {
        'application/json': {
          schema: createResponseSchema(studyKitSchema),
        },
      },
    },
  },
});

export const getListStudyKitRoute = createRoute({
  operationId: 'getListStudyKit',
  tags: ['study-kit'],
  method: 'get',
  path: '/study-kit',
  request: {},
  responses: {
    200: {
      description: 'List of All Study Kits',
      content: {
        'application/json': {
          schema: createResponseSchema(listStudyKitSchema),
        },
      },
    },
  },
});

export const getStudyKitByGroupIdRoute = createRoute({
  operationId: 'getStudyKitByGroupId',
  tags: ['study-kit'],
  method: 'get',
  path: '/study-kit/group/:id',
  request: {
    params: studyKitGroupIdParamsSchema,
  },
  responses: {
    200: {
      description: 'List of Study Kits by Group ID',
      content: {
        'application/json': {
          schema: createResponseSchema(studyKitSchema),
        },
      },
    },
  },
});

export const getStudyKitRoute = createRoute({
  operationId: 'getStudyKit',
  tags: ['study-kit'],
  method: 'get',
  path: '/study-kit/:id',
  request: {
    params: studyKitIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Study Kits By Id',
      content: {
        'application/json': {
          schema: createResponseSchema(studyKitSchema),
        },
      },
    },
  },
});

export const updateStudyKitRoute = createRoute({
  operationId: 'updateStudyKit',
  tags: ['study-kit'],
  method: 'put',
  path: '/study-kit/:id',
  request: {
    params: studyKitIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateStudyKitSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Update Study Kit',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const deleteStudyKitRoute = createRoute({
  operationId: 'deleteStudyKit',
  tags: ['study-kit'],
  method: 'delete',
  path: '/study-kit/:id',
  request: {
    params: studyKitIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Delete Study Kit',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const getStudyKitsWithLastMessageRoute = createRoute({
  operationId: 'getStudyKitsWithLastMessage',
  tags: ['study-kit'],
  method: 'get',
  path: '/study-kit/with-last-message',
  request: {},
  responses: {
    200: {
      description: 'List of Study Kits with last message',
      content: {
        'application/json': {
          schema: createResponseSchema(listStudyKitWithLastMessageSchema),
        },
      },
    },
  },
});

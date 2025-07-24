import { createRoute } from '@hono/zod-openapi';

import { createResponseSchema } from '@/lib/response-factory';
import {
  createStudyKitGroupSchema,
  listStudyKitGroupsSchema,
  studyKitGroupIdParamsSchema,
  studyKitGroupsSchema,
  updateStudyKitGroupSchema,
} from '@/types/study-kit-group.type';

export const createStudyKitGroupRoute = createRoute({
  operationId: 'createStudyKitGroup',
  tags: ['study-kit-group'],
  method: 'post',
  path: '/study-kit-group',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createStudyKitGroupSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Study Kit Group created successfully',
      content: {
        'application/json': {
          schema: createResponseSchema(studyKitGroupsSchema),
        },
      },
    },
  },
});

export const getListStudyKitGroupRoute = createRoute({
  operationId: 'getListStudyKitGroup',
  tags: ['study-kit-group'],
  method: 'get',
  path: '/study-kit-group',
  request: {},
  responses: {
    200: {
      description: 'List of Study Kit Groups',
      content: {
        'application/json': {
          schema: createResponseSchema(listStudyKitGroupsSchema),
        },
      },
    },
  },
});

export const getStudyKitGroupRoute = createRoute({
  operationId: 'getStudyKitGroup',
  tags: ['study-kit-group'],
  method: 'get',
  path: '/study-kit-group/:id',
  request: {
    params: studyKitGroupIdParamsSchema,
  },
  responses: {
    200: {
      description: 'List of Study Kit Groups',
      content: {
        'application/json': {
          schema: createResponseSchema(studyKitGroupsSchema),
        },
      },
    },
  },
});

export const updateStudyKitGroupRoute = createRoute({
  operationId: 'updateStudyKitGroup',
  tags: ['study-kit-group'],
  method: 'put',
  path: '/study-kit-group/:id',
  request: {
    params: studyKitGroupIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateStudyKitGroupSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Study Kit Group updated successfully',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const deleteStudyKitGroupRoute = createRoute({
  operationId: 'deleteStudyKitGroup',
  tags: ['study-kit-group'],
  method: 'delete',
  path: '/study-kit-group/:id',
  request: {
    params: studyKitGroupIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Study Kit Group deleted successfully',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

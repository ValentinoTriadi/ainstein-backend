import { createRoute } from '@hono/zod-openapi';

import { createResponseSchema } from '@/lib';
import { idParamsSchema } from '@/types/generic.type';
import {
  createVideoCommentSchema,
  createVideoSchema,
  listVideoSchema,
  searchVideoQuerySchema,
  updateVideoCommentSchema,
  updateVideoSchema,
  videoIdParamsSchema,
  videoSchema,
} from '@/types/video.type';

export const createVideoRoute = createRoute({
  operationId: 'createVideo',
  tags: ['video'],
  method: 'post',
  path: '/video',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createVideoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Create Video',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const getListVideoRoute = createRoute({
  operationId: 'getListVideo',
  tags: ['video'],
  method: 'get',
  path: '/video',
  request: {
    query: searchVideoQuerySchema,
  },
  responses: {
    200: {
      description: 'List of All Videos',
      content: {
        'application/json': {
          schema: createResponseSchema(listVideoSchema),
        },
      },
    },
  },
});

export const getVideoRoute = createRoute({
  operationId: 'getVideo',
  tags: ['video'],
  method: 'get',
  path: '/video/:id',
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Video By Id',
      content: {
        'application/json': {
          schema: createResponseSchema(videoSchema),
        },
      },
    },
  },
});

export const updateVideoRoute = createRoute({
  operationId: 'updateVideo',
  tags: ['video'],
  method: 'put',
  path: '/video/:id',
  request: {
    params: idParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateVideoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Update Video',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const deleteVideoRoute = createRoute({
  operationId: 'deleteVideo',
  tags: ['video'],
  method: 'delete',
  path: '/video/:id',
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Delete Video',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

// Like Routes
export const likeVideoRoute = createRoute({
  operationId: 'likeVideo',
  tags: ['video'],
  method: 'post',
  path: '/video/:videoId/like',
  request: {
    params: videoIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Like Video',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const unlikeVideoRoute = createRoute({
  operationId: 'unlikeVideo',
  tags: ['video'],
  method: 'delete',
  path: '/video/:videoId/unlike',
  request: {
    params: videoIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Unlike Video',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

// Comment Routes
export const createVideoCommentRoute = createRoute({
  operationId: 'createVideoComment',
  tags: ['video'],
  method: 'post',
  path: '/video/comment',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createVideoCommentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Comment Video',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const editVideoCommentRoute = createRoute({
  operationId: 'editVideoComment',
  tags: ['video'],
  method: 'put',
  path: '/video/comment/:id',
  request: {
    params: idParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateVideoCommentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Update Video Comment',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const deleteVideoCommentRoute = createRoute({
  operationId: 'deleteVideoComment',
  tags: ['video'],
  method: 'delete',
  path: '/video/comment/:id',
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Delete Video Comment',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

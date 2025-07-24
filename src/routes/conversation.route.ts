import { createRoute } from '@hono/zod-openapi';

import { createResponseSchema } from '@/lib';
import {
  conversationSchema,
  listConversationSchema,
  createConversationSchema,
  conversationHistorySchema,
  listConversationHistorySchema,
  sendMessageSchema,
  chatResponseSchema,
  conversationIdParamsSchema,
} from '@/types/conversation.type';

export const createConversationRoute = createRoute({
  operationId: 'createConversation',
  tags: ['conversation'],
  method: 'post',
  path: '/conversation/start',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createConversationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Start a new conversation',
      content: {
        'application/json': {
          schema: createResponseSchema(conversationSchema),
        },
      },
    },
  },
});

export const getListConversationRoute = createRoute({
  operationId: 'getListConversation',
  tags: ['conversation'],
  method: 'get',
  path: '/conversation/list',
  request: {},
  responses: {
    200: {
      description: 'List of user conversations',
      content: {
        'application/json': {
          schema: createResponseSchema(listConversationSchema),
        },
      },
    },
  },
});

export const getConversationRoute = createRoute({
  operationId: 'getConversation',
  tags: ['conversation'],
  method: 'get',
  path: '/conversation/:id',
  request: {
    params: conversationIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Get conversation details',
      content: {
        'application/json': {
          schema: createResponseSchema(conversationSchema),
        },
      },
    },
  },
});

export const getConversationHistoryRoute = createRoute({
  operationId: 'getConversationHistory',
  tags: ['conversation'],
  method: 'get',
  path: '/conversation/:id/history',
  request: {
    params: conversationIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Get conversation message history',
      content: {
        'application/json': {
          schema: createResponseSchema(listConversationHistorySchema),
        },
      },
    },
  },
});

export const sendMessageRoute = createRoute({
  operationId: 'sendMessage',
  tags: ['conversation'],
  method: 'post',
  path: '/conversation/:id/message',
  request: {
    params: conversationIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: sendMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Send message and get AI response',
      content: {
        'application/json': {
          schema: createResponseSchema(chatResponseSchema),
        },
      },
    },
    400: {
      description: 'Bad request or conversation not found',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
});

export const deleteConversationRoute = createRoute({
  operationId: 'deleteConversation',
  tags: ['conversation'],
  method: 'delete',
  path: '/conversation/:id',
  request: {
    params: conversationIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Delete conversation',
      content: {
        'application/json': {
          schema: createResponseSchema(),
        },
      },
    },
  },
}); 
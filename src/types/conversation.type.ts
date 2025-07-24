import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { conversationHistory, conversations } from '@/db/schema';

// CONVERSATION SCHEMAS
export const conversationSchema = createSelectSchema(conversations, {
  startedAt: z.union([z.string(), z.date()]),
  lastUpdated: z.union([z.string(), z.date()]),
}).openapi('Conversation');

export const listConversationSchema = z.array(conversationSchema);

export const createConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  userId: true,
  startedAt: true,
  lastUpdated: true,
});

// CONVERSATION HISTORY SCHEMAS
export const conversationHistorySchema = createSelectSchema(
  conversationHistory,
  {
    timestamp: z.union([z.string(), z.date()]),
  },
).openapi('ConversationHistory');

export const listConversationHistorySchema = z.array(conversationHistorySchema);

export const createConversationHistorySchema = createInsertSchema(
  conversationHistory,
).omit({
  id: true,
  timestamp: true,
});

// MESSAGE SCHEMAS FOR API
export const sendMessageSchema = z
  .object({
    message: z.string().min(1, 'Message cannot be empty'),
  })
  .openapi('SendMessage');

export const chatResponseSchema = z
  .object({
    message: z.string(),
    conversationId: z.string(),
  })
  .openapi('ChatResponse');

// PARAMS SCHEMAS
export const conversationIdParamsSchema = z.object({ id: z.string() });

// TYPES
export type Conversation = z.infer<typeof conversationSchema>;
export type CreateConversation = z.infer<typeof createConversationSchema>;
export type ConversationHistory = z.infer<typeof conversationHistorySchema>;
export type CreateConversationHistory = z.infer<
  typeof createConversationHistorySchema
>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;

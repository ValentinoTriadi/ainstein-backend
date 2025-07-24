import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

import { env } from '@/configs';
import { db } from '@/db/drizzle';
import { createAuthRouter } from '@/lib';
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversationHistory,
  getListConversation,
  addMessageToHistory,
} from '@/repositories/conversation.repository';
import {
  createConversationRoute,
  deleteConversationRoute,
  getConversationHistoryRoute,
  getConversationRoute,
  getListConversationRoute,
  sendMessageRoute,
} from '@/routes/conversation.route';

export const conversationProtectedRouter = createAuthRouter();

// Start a new conversation
conversationProtectedRouter.openapi(createConversationRoute, async (c) => {
  const body = c.req.valid('json');
  const user = c.var.user;
  const res = await createConversation(db, body, user);
  return c.json(res, (res.code as unknown) ?? 201);
});

// Get list of user's conversations
conversationProtectedRouter.openapi(getListConversationRoute, async (c) => {
  const user = c.var.user;
  const res = await getListConversation(db, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

// Get conversation details
conversationProtectedRouter.openapi(getConversationRoute, async (c) => {
  const params = c.req.valid('param');
  const user = c.var.user;
  const res = await getConversation(db, params.id, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

// Get conversation history
conversationProtectedRouter.openapi(getConversationHistoryRoute, async (c) => {
  const params = c.req.valid('param');
  const user = c.var.user;
  const res = await getConversationHistory(db, params.id, user);
  return c.json(res, (res.code as unknown) ?? 200);
});

// Send message and get AI response
conversationProtectedRouter.openapi(sendMessageRoute, async (c) => {
  const params = c.req.valid('param');
  const body = c.req.valid('json');
  const user = c.var.user;

  try {
    const { message } = body;
    const conversationId = params.id;

    // First, verify the conversation exists and belongs to the user
    const conversationResult = await getConversation(db, conversationId, user);
    if (!conversationResult.success || !conversationResult.data) {
      return c.json(conversationResult, (conversationResult.code as unknown) ?? 400);
    }

    // Get conversation history for context
    const historyResult = await getConversationHistory(db, conversationId, user);
    if (!historyResult.success || !historyResult.data) {
      return c.json(historyResult, (historyResult.code as unknown) ?? 400);
    }

    // Add user message to history
    const userMessageResult = await addMessageToHistory(
      db,
      conversationId,
      'user',
      message,
      user
    );

    if (!userMessageResult.success) {
      return c.json(userMessageResult, (userMessageResult.code as unknown) ?? 400);
    }

    // Prepare conversation context for AI
    const studyKit = conversationResult.data.studyKit;
    const conversationHistory = historyResult.data;
    
    // Build context from conversation history
    const messageHistory = conversationHistory.map((msg) => ({
      role: (msg.speaker === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.messageText,
    }));

    // Create system prompt based on study kit
    const systemPrompt = `Kamu adalah tutor AI yang membantu siswa dengan materi belajar mereka: "${studyKit.title}".
    
Deskripsi Materi Belajar: ${studyKit.description || 'Tidak ada deskripsi yang disediakan'}

Kamu harus:
- Memberikan respon yang membantu dan edukatif terkait materi belajar
- Mengajukan pertanyaan klarifikasi untuk lebih memahami kebutuhan siswa
- Menawarkan penjelasan, contoh, dan panduan
- Bersikap mendorong dan suportif
- Tetap fokus pada konten edukasi
- WAJIB merespons dalam Bahasa Indonesia

Buatlah respon yang ringkas namun informatif.`;

    // Generate AI response using the AI SDK
    const { text: aiResponse } = await generateText({
      model: google('gemini-2.0-flash-001'),
      system: systemPrompt,
      messages: [
        ...messageHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Add AI response to history
    const aiMessageResult = await addMessageToHistory(
      db,
      conversationId,
      'assistant',
      aiResponse,
      user
    );

    if (!aiMessageResult.success) {
      return c.json(aiMessageResult, (aiMessageResult.code as unknown) ?? 500);
    }

    // Return the AI response
    return c.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: aiResponse,
        conversationId,
      },
      code: 200,
    }, 200);

  } catch (error) {
    console.error('Error in AI conversation:', error);
    return c.json({
      success: false,
      message: 'Failed to process message',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    }, 500);
  }
});

// Delete conversation
conversationProtectedRouter.openapi(deleteConversationRoute, async (c) => {
  const params = c.req.valid('param');
  const user = c.var.user;
  const res = await deleteConversation(db, params.id, user);
  return c.json(res, (res.code as unknown) ?? 200);
}); 
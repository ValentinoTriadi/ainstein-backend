import { and, eq } from 'drizzle-orm';

import { first } from '@/db/db-helper';
import { Database } from '@/db/drizzle';
import { conversations, conversationHistory, studyKits } from '@/db/schema';
import { SessionUser } from '@/types/session.type';
import { CreateConversation, CreateConversationHistory } from '@/types/conversation.type';

export const createConversation = async (
  db: Database,
  body: CreateConversation,
  user: SessionUser,
) => {
  try {
    const { studyKitId } = body;
    const { id: userId } = user;

    // Verify study kit exists and belongs to user
    const studyKitExists = await db.query.studyKits.findFirst({
      where: and(eq(studyKits.id, studyKitId), eq(studyKits.userId, userId)),
    });

    if (!studyKitExists) {
      return {
        success: false,
        message: 'Study Kit not found or access denied',
        code: 404,
      };
    }

    const newConversation = await db
      .insert(conversations)
      .values({
        userId,
        studyKitId,
      })
      .returning()
      .then(first);

    return {
      success: true,
      message: 'Conversation created successfully',
      data: newConversation,
      code: 201,
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return {
      success: false,
      message: 'Failed to create conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getListConversation = async (db: Database, user: SessionUser) => {
  try {
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, user.id),
      with: {
        studyKit: {
          columns: {
            title: true,
            description: true,
          },
        },
      },
      orderBy: (conversations, { desc }) => [desc(conversations.lastUpdated)],
    });

    return {
      success: true,
      message: 'Conversations fetched successfully',
      data: userConversations,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return {
      success: false,
      message: 'Failed to fetch conversations',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getConversation = async (
  db: Database,
  conversationId: string,
  user: SessionUser,
) => {
  try {
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ),
      with: {
        studyKit: {
          columns: {
            title: true,
            description: true,
          },
        },
      },
    });

    if (!conversation) {
      return {
        success: false,
        message: 'Conversation not found',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Conversation fetched successfully',
      data: conversation,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return {
      success: false,
      message: 'Failed to fetch conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getConversationHistory = async (
  db: Database,
  conversationId: string,
  user: SessionUser,
) => {
  try {
    // First verify conversation belongs to user
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ),
    });

    if (!conversation) {
      return {
        success: false,
        message: 'Conversation not found',
        code: 404,
      };
    }

    const history = await db.query.conversationHistory.findMany({
      where: eq(conversationHistory.conversationId, conversationId),
      orderBy: (conversationHistory, { asc }) => [asc(conversationHistory.timestamp)],
    });

    return {
      success: true,
      message: 'Conversation history fetched successfully',
      data: history,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return {
      success: false,
      message: 'Failed to fetch conversation history',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const addMessageToHistory = async (
  db: Database,
  conversationId: string,
  speaker: string,
  messageText: string,
  user: SessionUser,
) => {
  try {
    // Verify conversation belongs to user
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ),
    });

    if (!conversation) {
      return {
        success: false,
        message: 'Conversation not found',
        code: 404,
      };
    }

    // Add message to history
    const newMessage = await db
      .insert(conversationHistory)
      .values({
        conversationId,
        speaker,
        messageText,
      })
      .returning()
      .then(first);

    // Update conversation last updated timestamp
    await db
      .update(conversations)
      .set({ lastUpdated: new Date() })
      .where(eq(conversations.id, conversationId));

    return {
      success: true,
      message: 'Message added to history successfully',
      data: newMessage,
      code: 201,
    };
  } catch (error) {
    console.error('Error adding message to history:', error);
    return {
      success: false,
      message: 'Failed to add message to history',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const deleteConversation = async (
  db: Database,
  conversationId: string,
  user: SessionUser,
) => {
  try {
    const result = await db
      .delete(conversations)
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ))
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Conversation not found',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Conversation deleted successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return {
      success: false,
      message: 'Failed to delete conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
}; 
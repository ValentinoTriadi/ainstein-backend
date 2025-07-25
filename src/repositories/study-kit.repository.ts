import { and, eq } from 'drizzle-orm';

import { first } from '@/db/db-helper';
import { Database } from '@/db/drizzle';
import { studyKitGroups, studyKits } from '@/db/schema';
import {
  conversationHistory,
  conversations,
} from '@/db/schema/conversation.schema';
import { SessionUser } from '@/types/session.type';
import { CreateStudyKit, UpdateStudyKit } from '@/types/study-kit.type';

import { createConversation } from './conversation.repository';

export const createStudyKit = async (
  db: Database,
  body: CreateStudyKit,
  user: SessionUser,
) => {
  try {
    const { groupId, title, description, imageUrl } = body;
    const { id: userId } = user;

    // find group to ensure it exists
    const groupExists = await db
      .select()
      .from(studyKitGroups)
      .where(
        and(eq(studyKitGroups.id, groupId), eq(studyKitGroups.userId, userId)),
      )
      .then(first);

    if (!groupExists) {
      return {
        success: false,
        message: 'Group not found',
        code: 404,
      };
    }

    const res = await db
      .insert(studyKits)
      .values({
        userId,
        groupId,
        title,
        description,
        imageUrl,
      })
      .returning()
      .then(first);

    return {
      success: true,
      message: 'Study Kit created successfully',
      data: res,
      code: 201,
    };
  } catch (error) {
    console.error('Error creating Study Kit:', error);
    return {
      success: false,
      message: 'Failed to create Study Kit',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getListStudyKit = async (db: Database, user: SessionUser) => {
  try {
    const kits = await db
      .select()
      .from(studyKits)
      .where(eq(studyKits.userId, user.id));

    return {
      success: true,
      message: 'Study Kits fetched successfully',
      data: kits,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching Study Kits:', error);
    return {
      success: false,
      message: 'Failed to fetch Study Kits',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getStudyKit = async (
  db: Database,
  kitId: string,
  user: SessionUser,
) => {
  try {
    const kit = await db.query.studyKits.findFirst({
      where: and(eq(studyKits.id, kitId), eq(studyKits.userId, user.id)),
      with: {
        quizzes: true,
        videos: true,
        flashcards: true,
      },
    });

    if (!kit) {
      return {
        success: false,
        message: 'Study Kit not found',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Study Kit fetched successfully',
      data: kit,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching Study Kit:', error);
    return {
      success: false,
      message: 'Failed to fetch Study Kit',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const updateStudyKit = async (
  db: Database,
  kitId: string,
  body: UpdateStudyKit,
  user: SessionUser,
) => {
  try {
    const { title, groupId, description } = body;
    const { id: userId } = user;

    const result = await db
      .update(studyKits)
      .set({ title, groupId, description })
      .where(and(eq(studyKits.id, kitId), eq(studyKits.userId, userId)))
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Study Kit not found or no changes made',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Study Kit updated successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error updating Study Kit:', error);
    return {
      success: false,
      message: 'Failed to update Study Kit',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const deleteStudyKit = async (
  db: Database,
  kitId: string,
  user: SessionUser,
) => {
  try {
    const result = await db
      .delete(studyKits)
      .where(and(eq(studyKits.id, kitId), eq(studyKits.userId, user.id)))
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Study Kit not found',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Study Kit deleted successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error deleting Study Kit:', error);
    return {
      success: false,
      message: 'Failed to delete Study Kit',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getStudyKitsWithLastMessage = async (
  db: Database,
  user: SessionUser,
) => {
  try {
    // Get all study kits for the user
    const kits = await db
      .select()
      .from(studyKits)
      .where(eq(studyKits.userId, user.id));
    if (!kits.length) {
      return {
        success: true,
        message: 'No study kits found',
        data: [],
        code: 200,
      };
    }
    // For each kit, get its conversation and last message
    const results = await Promise.all(
      kits.map(async (kit) => {
        // Find all conversations for this study kit, order by startedAt ascending
        const conversationsList = await db.query.conversations.findMany({
          where: and(
            eq(conversations.studyKitId, kit.id),
            eq(conversations.userId, user.id),
          ),
          orderBy: (conversations, { asc }) => [asc(conversations.startedAt)],
        });
        let conversation = conversationsList[0] || null;
        // If no conversation, create one
        if (!conversation) {
          const createRes = await createConversation(
            db,
            { studyKitId: kit.id },
            user,
          );
          if (createRes.success && createRes.data) {
            conversation = createRes.data;
          } else {
            throw new Error(
              'Failed to create conversation for study kit ' + kit.id,
            );
          }
        }
        // Get the last message in the conversation
        let lastMessage = null;
        if (conversation) {
          lastMessage = await db.query.conversationHistory.findFirst({
            where: eq(conversationHistory.conversationId, conversation.id),
            orderBy: (conversationHistory, { desc }) => [
              desc(conversationHistory.timestamp),
            ],
          });
        }
        return {
          id: kit.id,
          title: kit.title,
          imageUrl: 'imageUrl' in kit ? kit.imageUrl : null,
          lastMessage: lastMessage
            ? {
                speaker: lastMessage.speaker,
                messageText: lastMessage.messageText,
                timestamp: lastMessage.timestamp,
              }
            : null,
          conversationId: conversation.id,
        };
      }),
    );
    return {
      success: true,
      message: 'Study Kits with last message fetched successfully',
      data: results,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching Study Kits with last message:', error);
    return {
      success: false,
      message: 'Failed to fetch Study Kits with last message',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

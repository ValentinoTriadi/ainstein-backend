import { eq } from 'drizzle-orm';

import { Database } from '@/db/drizzle';
import { flashcards } from '@/db/schema/flashcard.schema';
import { CreateFlashcard, UpdateFlashcard } from '@/types/flashcard.type';
import { SessionUser } from '@/types/session.type';

export const createFlashcard = async (db: Database, body: CreateFlashcard) => {
  try {
    const [created] = await db.insert(flashcards).values(body).returning();
    return {
      success: true,
      message: 'Flashcard created',
      data: created,
      code: 201,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create flashcard',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getFlashcard = async (db: Database, id: string) => {
  try {
    const flashcard = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, id),
    });
    if (!flashcard) {
      return {
        success: false,
        message: 'Flashcard not found',
        code: 404,
      };
    }
    return {
      success: true,
      message: 'Flashcard found',
      data: flashcard,
      code: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get flashcard',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getListFlashcard = async (db: Database) => {
  try {
    const flashcardList = await db.query.flashcards.findMany();
    return {
      success: true,
      message: 'Flashcard list fetched',
      data: flashcardList,
      code: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch flashcard list',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const updateFlashcard = async (
  db: Database,
  id: string,
  body: UpdateFlashcard,
) => {
  try {
    const [updated] = await db
      .update(flashcards)
      .set(body)
      .where(eq(flashcards.id, id))
      .returning();
    if (!updated) {
      return {
        success: false,
        message: 'Flashcard not found',
        code: 404,
      };
    }
    return {
      success: true,
      message: 'Flashcard updated',
      data: updated,
      code: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update flashcard',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const deleteFlashcard = async (db: Database, id: string) => {
  try {
    const [deleted] = await db
      .delete(flashcards)
      .where(eq(flashcards.id, id))
      .returning();
    if (!deleted) {
      return {
        success: false,
        message: 'Flashcard not found',
        code: 404,
      };
    }
    return {
      success: true,
      message: 'Flashcard deleted',
      code: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to delete flashcard',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export interface FlashcardData {
  frontText: string;
  backText: string;
}

export const createFlashcardsFromAI = async (
  db: Database,
  studyKitId: string,
  flashcardData: FlashcardData[],
  user: SessionUser,
) => {
  try {
    const { id: userId } = user;

    return await db.transaction(async (tx) => {
      // Create all flashcards
      const newFlashcards = await tx
        .insert(flashcards)
        .values(
          flashcardData.map((card) => ({
            studyKitId,
            frontText: card.frontText,
            backText: card.backText,
          })),
        )
        .returning();

      return {
        success: true,
        message: 'Flashcards created successfully',
        data: {
          flashcardIds: newFlashcards.map((card) => card.id),
          count: newFlashcards.length,
        },
        code: 201,
      };
    });
  } catch (error) {
    console.error('Error creating AI-generated flashcards:', error);
    return {
      success: false,
      message: 'Failed to create flashcards',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

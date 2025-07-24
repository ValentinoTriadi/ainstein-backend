import { Database } from '@/db/drizzle';
import { flashcards } from '@/db/schema';
import { SessionUser } from '@/types/session.type';

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
          }))
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
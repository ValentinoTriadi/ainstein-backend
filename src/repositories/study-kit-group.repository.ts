import { and, eq } from 'drizzle-orm';

import { first } from '@/db/db-helper';
import { Database } from '@/db/drizzle';
import { studyKitGroups } from '@/db/schema';
import { SessionUser } from '@/types/session.type';
import {
  CreateStudyKitGroup,
  UpdateStudyKitGroup,
} from '@/types/study-kit-group.type';

export const createStudyKitGroup = async (
  db: Database,
  body: CreateStudyKitGroup,
  user: SessionUser,
) => {
  try {
    const { name, description } = body;
    const { id: userId } = user;
    const res = await db
      .insert(studyKitGroups)
      .values({
        userId,
        name,
        description,
      })
      .returning()
      .then(first);

    return {
      success: true,
      message: 'Study Kit Group created successfully',
      data: res,
      code: 201,
    };
  } catch (error) {
    console.error('Error creating Study Kit Group:', error);
    return {
      success: false,
      message: 'Failed to create Study Kit Group',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getListStudyKitGroup = async (db: Database, user: SessionUser) => {
  try {
    const groups = await db
      .select()
      .from(studyKitGroups)
      .where(eq(studyKitGroups.userId, user.id));

    return {
      success: true,
      message: 'Study Kit Groups fetched successfully',
      data: groups,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching Study Kit Groups:', error);
    return {
      success: false,
      message: 'Failed to fetch Study Kit Groups',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const getStudyKitGroup = async (
  db: Database,
  groupId: string,
  user: SessionUser,
) => {
  try {
    const group = await db
      .select()
      .from(studyKitGroups)
      .where(
        and(eq(studyKitGroups.id, groupId), eq(studyKitGroups.userId, user.id)),
      )
      .then(first);

    if (!group) {
      return {
        success: false,
        message: 'Study Kit Group not found',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Study Kit Group fetched successfully',
      data: group,
      code: 200,
    };
  } catch (error) {
    console.error('Error fetching Study Kit Group:', error);
    return {
      success: false,
      message: 'Failed to fetch Study Kit Group',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const updateStudyKitGroup = async (
  db: Database,
  groupId: string,
  body: UpdateStudyKitGroup,
  user: SessionUser,
) => {
  try {
    const { name, description } = body;
    const { id: userId } = user;

    const result = await db
      .update(studyKitGroups)
      .set({ name, description })
      .where(
        and(eq(studyKitGroups.id, groupId), eq(studyKitGroups.userId, userId)),
      )
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Study Kit Group not found or no changes made',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Study Kit Group updated successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error updating Study Kit Group:', error);
    return {
      success: false,
      message: 'Failed to update Study Kit Group',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

export const deleteStudyKitGroup = async (
  db: Database,
  groupId: string,
  user: SessionUser,
) => {
  try {
    const result = await db
      .delete(studyKitGroups)
      .where(
        and(eq(studyKitGroups.id, groupId), eq(studyKitGroups.userId, user.id)),
      )
      .returning()
      .then(first);

    if (!result) {
      return {
        success: false,
        message: 'Study Kit Group not found',
        code: 404,
      };
    }

    return {
      success: true,
      message: 'Study Kit Group deleted successfully',
      code: 200,
    };
  } catch (error) {
    console.error('Error deleting Study Kit Group:', error);
    return {
      success: false,
      message: 'Failed to delete Study Kit Group',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
};

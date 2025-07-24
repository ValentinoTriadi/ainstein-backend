import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { studyKitGroups } from '@/db/schema';

// READ
export const studyKitGroupsSchema = createSelectSchema(studyKitGroups, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('StudyKitGroups');
export const listStudyKitGroupsSchema = z.array(studyKitGroupsSchema);

// CREATE
export const createStudyKitGroupSchema = createInsertSchema(
  studyKitGroups,
).omit({ id: true, userId: true, createdAt: true });

// UPDATE
export const updateStudyKitGroupSchema = createStudyKitGroupSchema.partial();

// PARAMS
export const studyKitGroupIdParamsSchema = z.object({ id: z.string() });

// TYPES
export type StudyKitGroup = z.infer<typeof studyKitGroupsSchema>;
export type CreateStudyKitGroup = z.infer<typeof createStudyKitGroupSchema>;
export type UpdateStudyKitGroup = z.infer<typeof updateStudyKitGroupSchema>;

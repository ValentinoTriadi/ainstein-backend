import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { studyKits } from '@/db/schema';

// READ
export const studyKitSchema = createSelectSchema(studyKits, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('StudyKit');
export const listStudyKitSchema = z.array(studyKitSchema);

// CREATE
export const createStudyKitSchema = createInsertSchema(studyKits).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// UPDATE
export const updateStudyKitSchema = createStudyKitSchema.partial();

// PARAMS
export const studyKitIdParamsSchema = z.object({ id: z.string() });

// TYPES
export type StudyKit = z.infer<typeof studyKitSchema>;
export type CreateStudyKit = z.infer<typeof createStudyKitSchema>;
export type UpdateStudyKit = z.infer<typeof updateStudyKitSchema>;

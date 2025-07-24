import { z } from 'zod';

import { genericSchema } from '@/types/generic.type';

// Factory function to create extended response schema with data
export function createResponseSchema<T extends z.ZodType>(dataSchema?: T) {
  if (!dataSchema) {
    return genericSchema;
  }
  return genericSchema.extend({
    data: dataSchema.optional(),
  });
}

// Helper function to create success response
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

// Helper function to create error response
export function createErrorResponse(message: string) {
  return {
    success: false,
    message,
  };
}

// Type helpers
export type ResponseSchema<T extends z.ZodType> = z.infer<
  ReturnType<typeof createResponseSchema<T>>
>;
export type BaseResponse = z.infer<typeof genericSchema>;

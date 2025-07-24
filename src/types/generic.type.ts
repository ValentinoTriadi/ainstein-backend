import z from 'zod';

export const genericSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  code: z.number().default(200),
});

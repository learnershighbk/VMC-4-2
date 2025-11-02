import { z } from 'zod';

export const ExampleParamsSchema = z.object({
  id: z.string().uuid(),
});

export const ExampleResponseSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().url(),
  updatedAt: z.string(),
});

export type ExampleResponse = z.infer<typeof ExampleResponseSchema>;


import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email().refine(e => e.endsWith('@mmmut.ac.in'), {
      message: 'Only @mmmut.ac.in emails are allowed',
    }),
    password: z.string().min(8),
    fullName: z.string().min(2),
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
    rollNo: z.string().optional(),
    branch: z.string().optional(),
    year: z.number().int().optional(),
    semester: z.number().int().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

import { hash, verify } from 'argon2';
import { z } from 'zod';

export const emailSchema = z.email().trim().toLowerCase();

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters.')
  .max(128, 'Password must be 128 characters or fewer.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const signupSchema = z
  .object({
    addressLine1: z.string().trim().min(1),
    collectionNotes: z.string().trim().optional(),
    email: emailSchema,
    name: z.string().trim().min(1),
    password: passwordSchema,
    passwordConfirm: z.string(),
    postcode: z.string().trim().optional(),
    suburb: z.string().trim().min(1),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ['passwordConfirm'],
  });

export async function hashPassword(password: string) {
  return hash(password);
}

export async function verifyPassword(hashValue: string, password: string) {
  return verify(hashValue, password);
}

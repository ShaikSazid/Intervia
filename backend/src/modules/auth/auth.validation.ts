import { z } from "zod";

export const signupSchema = z.object({
    email: z.email(),
    username: z.string().optional(),
    password: z.string()
});

export type RegisterDto = z.infer<typeof signupSchema>

export const loginSchema = z.object({
    email: z.email(),
    password: z.string()
});

export type loginDto = z.infer<typeof loginSchema>
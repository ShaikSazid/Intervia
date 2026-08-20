import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(3, "Password must be atleast 4 characters").max(128, "Password cannot exceed 128 characters")
});

export type LoginFormData = z.infer<typeof loginSchema>;
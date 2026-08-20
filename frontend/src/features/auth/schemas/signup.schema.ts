import { z } from "zod";

export const signupSchema = z.object({
    email: z.email("Invalid email address").trim().toLowerCase(),
    username: z.string().trim().min(3, "Username must be atleast 3 characters").max(30, "Username cannot exceed 30 characters"),
    password: z.string().min(5, "Password must be atleast 5 characters").max(128, "Password cannot exceed 128 characters"),
    confirmPassword: z.string()
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export type SignupFormData = z.infer<typeof signupSchema>;
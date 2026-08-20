import type z from "zod";
import type { signupSchema } from "../schemas/signup.schema";

export interface User {
    id: string;
    email: string;
    username: string | null;
}

export type SignupRequest = z.infer<typeof signupSchema>;
import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    DATABASE_URL: z.url(),
    PORT: z.coerce.number().default(8080),
    AWS_REGION: z.string().min(1),
    AWS_BUCKET_NAME: z.string().min(1), 
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
    FRONTEND_URL: z.url(),
});

export const env = envSchema.parse(process.env);
import { z } from "zod";

export const resumeParamsSchema = z.object({
    resumeId: z.string().trim().min(1, "Resume ID is required").cuid()
});

export type ResumeParams = z.infer<typeof resumeParamsSchema>;
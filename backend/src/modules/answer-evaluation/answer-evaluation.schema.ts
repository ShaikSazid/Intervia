import { z } from "zod";

export const answerEvaluationSchema = z.object({
    score: z.number().min(0).max(10),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    feedback: z.string(),
    followUpRequired: z.boolean(),
    suggestedDifficulty: z.enum(["EASY", "MEDIUM", "HARD"])
});
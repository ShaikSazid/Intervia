import { z } from "zod";

export const interviewQuestionSchema = z.object({
    question: z.string(),
    claimId: z.string(),
    reasoning: z.string(),
    expectedTopics: z.array(z.string())
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;
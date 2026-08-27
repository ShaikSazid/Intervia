import { z } from "zod";


export const answerBehaviorSchema =
    z.enum([
        "STRONG",
        "PARTIAL",
        "WEAK",
        "NO_ANSWER",
        "DONT_REMEMBER",
        "OFF_TOPIC",
        "FRUSTRATED",
        "CONTRADICTORY",
    ]);


export const answerEvaluationSchema =
    z.object({

        score:
            z.number()
                .min(0)
                .max(10),

        strengths:
            z.array(
                z.string()
            ),

        weaknesses:
            z.array(
                z.string()
            ),

        feedback:
            z.string(),

        followUpRequired:
            z.boolean(),

        suggestedDifficulty:
            z.enum([
                "EASY",
                "MEDIUM",
                "HARD",
            ]),

        answerBehavior:
            answerBehaviorSchema,
    });
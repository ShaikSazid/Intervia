import { z } from "zod";


export const interviewReasoningSchema = z.object({

    reasoning:
        z.string(),

    objective:
        z.string(),

    investigationArea:
        z.enum([
            "OWNERSHIP",
            "IMPLEMENTATION",
            "ARCHITECTURE",
            "API",
            "DATABASE",
            "AUTHENTICATION",
            "ERROR_HANDLING",
            "DEBUGGING",
            "DEPLOYMENT",
            "SCALABILITY",
            "TECHNICAL_DECISION",
            "TRADE_OFF",
            "CHALLENGE",
            "PRACTICAL_USAGE",
            "PROBLEM_SOLVING",
            "GENERAL",
        ]),

    questionType:
        z.enum([
            "FOLLOW_UP",
            "PROBE_CLAIM",
            "NEW_TOPIC",
            "PROJECT",
            "SCENARIO",
            "IMPLEMENTATION",
        ]),

    stayOnCurrentTopic:
        z.boolean(),

    increaseDifficulty:
        z.boolean(),

    referenceResume:
        z.boolean(),

    askImplementationQuestion:
        z.boolean(),
});
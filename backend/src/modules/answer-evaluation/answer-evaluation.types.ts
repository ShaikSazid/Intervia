export type AnswerBehavior =
    | "STRONG"
    | "PARTIAL"
    | "WEAK"
    | "NO_ANSWER"
    | "DONT_REMEMBER"
    | "OFF_TOPIC"
    | "FRUSTRATED"
    | "CONTRADICTORY";


export interface EvaluateAnswerInput {

    question:
        string;

    answer:
        string;

    targetRole:
        string;

    topic:
        string;

    difficulty:
        string;

    candidateProfileSummary?:
        string;
}


export interface AnswerEvaluation {

    score:
        number;

    strengths:
        string[];

    weaknesses:
        string[];

    feedback:
        string;

    followUpRequired:
        boolean;

    suggestedDifficulty:
        "EASY"
        | "MEDIUM"
        | "HARD";

    answerBehavior:
        AnswerBehavior;
}
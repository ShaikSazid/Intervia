export type InterviewMode =
    | "VOICE"
    | "VIDEO";


export type InterviewStatus =
    | "IDLE"
    | "CONNECTING"
    | "LISTENING"
    | "AI_SPEAKING"
    | "PROCESSING"
    | "ENDED"
    | "ERROR";


export interface InterviewSession {
    id: string | null;

    mode: InterviewMode;

    status: InterviewStatus;

    questionNumber: number;

    currentQuestion: string | null;

    transcript: string;

    error: string | null;
}
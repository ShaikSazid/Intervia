export interface ConversationMemory {
    sequenceNumber: number;

    question: string;

    answer: string | null;

    score: number | null;

    feedback: string | null;
}
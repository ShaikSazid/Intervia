export interface StartInterviewDto {
    sessionId: string;
}

export interface SubmitAnswerDto {
    sessionId: string;
    answer: string;
}
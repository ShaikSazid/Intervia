export type InterviewConversationMode =
    | "CLAIM_INVESTIGATION"
    | "GUIDED_RECOVERY"
    | "FUNDAMENTALS_CHECK"
    | "OPEN_DISCUSSION"
    | "TRANSITION";


export type ConversationThreadStatus =
    | "OPEN"
    | "RESOLVED"
    | "BLOCKED";


export interface ConversationState {

    /*
     * Current conversational mode.
     *
     * This describes HOW the interviewer should behave.
     */
    mode: InterviewConversationMode;


    /*
     * Current conversational thread.
     */
    currentThread: string | null;


    /*
     * Whether the current thread is still productive.
     */
    threadStatus: ConversationThreadStatus;


    /*
     * Evidence that has already been demonstrated.
     */
    demonstratedEvidence: string[];


    /*
     * Evidence that is still missing.
     */
    missingEvidence: string[];


    /*
     * Number of consecutive unsuccessful attempts.
     */
    failedAttempts: number;


    /*
     * Recent question IDs.
     */
    recentQuestionIds: string[];


    /*
     * Recent question text.
     */
    recentQuestionTexts: string[];


    /*
     * Recent candidate answers.
     */
    recentAnswerTexts: string[];


    /*
     * Contradictions that still need clarification.
     */
    unresolvedContradictions: string[];


    /*
     * Whether the candidate has explicitly shown frustration.
     */
    candidateFrustrated: boolean;
}
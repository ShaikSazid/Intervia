import { InterviewContext } from "../interview-context/interview-context.types.js";

import {
    AnswerEvaluation,
} from "../answer-evaluation/answer-evaluation.types.js";

import {
    InterviewDecision,
} from "../interview-brain/brain/interview-decision.types.js";

import {
    ResumeClaim,
} from "../interview-brain/claims/resume-claim.types.js";

import {
    ClaimAssessment,
} from "../interview-brain/claims/claim-assessment.types.js";


export const buildReasoningPrompt = (
    interviewContext: InterviewContext,
    evaluation: AnswerEvaluation,
    decision: InterviewDecision,
    claim: ResumeClaim,
    assessment: ClaimAssessment,
): string => {

    /*
     * ============================================================
     * Current claim progress
     * ============================================================
     */

    const claimProgress =
        interviewContext.sessionProgress
            .interviewState
            .claimProgress
            .find(
                (progress) =>
                    progress.claimId === claim.id
            );


    /*
     * ============================================================
     * Investigation attempts for this claim
     * ============================================================
     *
     * Only the information required to avoid repeating
     * unsuccessful investigation approaches is retained.
     */

    const investigationAttempts =
        interviewContext.sessionProgress
            .interviewState
            .investigationAttempts
            .filter(
                (attempt) =>
                    attempt.claimId === claim.id
            )
            .map(
                (attempt) => ({
                    investigationArea:
                        attempt.investigationArea,

                    objective:
                        attempt.objective,

                    outcome:
                        attempt.outcome,

                    question:
                        attempt.question,
                })
            );


    /*
     * ============================================================
     * Recent conversation
     * ============================================================
     *
     * The reasoning agent only needs the most recent exchanges
     * to understand conversational continuity.
     *
     * Keep this intentionally small.
     */

    const recentConversation =
        interviewContext.conversationHistory
            .slice(-3)
            .map(
                (turn) => ({
                    question:
                        turn.question,

                    answer:
                        turn.answer ?? null,

                    score:
                        turn.score ?? null,

                    feedback:
                        turn.feedback ?? null,
                })
            );


    /*
     * ============================================================
     * Current stage
     * ============================================================
     *
     * The reasoning agent needs the stage objective and difficulty,
     * but does not need every field of the stage object.
     */

    const currentStage =
        interviewContext.currentStage;

    const stageContext = {
        topic:
            currentStage.topic,

        difficulty:
            currentStage.difficulty,

        objectives:
            currentStage.objectives,
    };


    /*
     * ============================================================
     * Resume context
     * ============================================================
     *
     * Resume evidence remains available because the reasoning agent
     * must stay grounded in the supplied resume-backed claim.
     */

    const resumeContext =
        interviewContext.resumeContext;


    /*
     * ============================================================
     * Build compact reasoning prompt
     * ============================================================
     */

    return `
# ROLE

Determine HOW the Interview Brain decision should be executed.

The Brain has already decided WHAT happens next.

Do not override the Brain decision.

Your output must determine:

- objective
- investigationArea
- questionType
- stayOnCurrentTopic
- increaseDifficulty
- referenceResume
- askImplementationQuestion

# BRAIN DECISION

${JSON.stringify(
    decision,
    null,
    2
)}

# CURRENT STAGE

${JSON.stringify(
    stageContext,
    null,
    2
)}

# CURRENT RESUME CLAIM

${JSON.stringify(
    claim,
    null,
    2
)}

# CLAIM ASSESSMENT

${JSON.stringify(
    assessment,
    null,
    2
)}

# CLAIM PROGRESS

${JSON.stringify(
    claimProgress ?? null,
    null,
    2
)}

# PREVIOUS INVESTIGATION ATTEMPTS

${
    investigationAttempts.length === 0
        ? "None."
        : JSON.stringify(
            investigationAttempts,
            null,
            2
        )
}

# ALREADY INVESTIGATED AREAS

${JSON.stringify(
    claimProgress?.investigatedAreas ?? [],
    null,
    2
)}

# LATEST ANSWER EVALUATION

${JSON.stringify(
    evaluation,
    null,
    2
)}

# RECENT CONVERSATION

${
    recentConversation.length === 0
        ? "No previous conversation."
        : JSON.stringify(
            recentConversation,
            null,
            2
        )
}

# RESUME CONTEXT

${resumeContext || "No resume context available."}

# REASONING RULES

1. Follow the Brain decision exactly.

2. Stay on the supplied claim unless the Brain decision
   explicitly moves to another claim or stage.

3. Choose exactly ONE investigationArea.

4. Choose an objective that identifies the highest-value
   missing evidence for the current claim.

5. Use the latest answer as the strongest conversational signal.

6. Do not repeat an investigation objective that has already
   been adequately answered.

7. If a previous attempt resulted in NO_ANSWER:
   prefer a simpler or more concrete approach.

8. If a previous attempt resulted in DONT_REMEMBER:
   use a nearby memory cue when appropriate.

9. If a previous attempt resulted in WEAK:
   prefer clarification, a concrete example, or a different
   supported angle according to the Brain decision.

10. If the Brain decision is CHANGE_ANGLE:
    choose a different supported investigation area.

11. If the Brain decision is CLARIFY_CONTRADICTION:
    focus on resolving the conflicting evidence.

12. If the Brain decision is RECOVER_CONVERSATION:
    simplify the approach and do not increase difficulty.

13. If the Brain decision is PROBE_CLAIM:
    deepen the investigation using an area not already
    adequately explored.

14. If the Brain decision is FOLLOW_UP:
    stay close to the current conversational thread.

15. If the Brain decision is MOVE_TO_NEXT_CLAIM:
    treat the supplied claim as the new investigation target.

16. If the Brain decision is MOVE_TO_NEXT_STAGE:
    use the supplied stage and claim as authoritative.

17. For resume-backed claims, referenceResume should normally
    be true.

18. Do not invent technologies, implementation details,
    responsibilities, projects, or evidence.

19. Do not generate the actual interview question.

20. Keep the reasoning field concise:
    maximum 2 short sentences.

# QUESTION TYPE RULES

FOLLOW_UP
→ FOLLOW_UP

RECOVER_CONVERSATION
→ FOLLOW_UP

PROBE_CLAIM
→ PROBE_CLAIM

CHANGE_ANGLE
→ PROBE_CLAIM

CLARIFY_CONTRADICTION
→ FOLLOW_UP

MOVE_TO_NEXT_CLAIM
→ NEW_TOPIC, PROJECT, or IMPLEMENTATION

MOVE_TO_NEXT_STAGE
→ choose the appropriate type for the supplied stage.

# OUTPUT

Return only the structured reasoning object.
`;
};
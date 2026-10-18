import { GenerateQuestionInput } from "./interview-engine.types.js";


export const buildInterviewPrompt = (
    input: GenerateQuestionInput
) => {

    const {
        interviewContext,
        reasoning,
        claim,
        assessment,
        decision,
        interviewState,
        investigationIntent,
    } = input;


    /*
     * ============================================================
     * Current stage
     * ============================================================
     *
     * The question generator only needs the stage information
     * that affects the next question.
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
     * Current claim progress
     * ============================================================
     */

    const claimProgress =
        interviewState.claimProgress.find(
            (progress) =>
                progress.claimId ===
                claim.id
        );


    /*
     * ============================================================
     * Investigation attempts
     * ============================================================
     *
     * Only the attempts for the current claim are relevant.
     *
     * Keep only the information needed to avoid repeating
     * unsuccessful approaches.
     */

    const investigationAttempts =
        interviewState.investigationAttempts
            .filter(
                (attempt) =>
                    attempt.claimId ===
                    claim.id
            )
            .map(
                (attempt) => ({
                    investigationArea:
                        attempt.investigationArea,

                    objective:
                        attempt.objective,

                    question:
                        attempt.question,

                    outcome:
                        attempt.outcome,
                })
            );


    /*
     * ============================================================
     * Previous investigation / transition context
     * ============================================================
     */

    const previousInvestigationAttempt =
        interviewState.investigationAttempts
            .filter(
                (attempt) =>
                    attempt.claimId !==
                    claim.id
            )
            .at(-1);


    const previousClaim =
        previousInvestigationAttempt
            ? interviewContext
                .sessionProgress
                .candidateModel
                .claims
                .find(
                    (candidateClaim) =>
                        candidateClaim.id ===
                        previousInvestigationAttempt.claimId
                )
            : undefined;


    const transitionContext =
        decision.type ===
        "MOVE_TO_NEXT_CLAIM"

            ? `
Previous investigated claim:
${previousClaim?.title ?? "Unknown"}

Previous investigation area:
${previousInvestigationAttempt?.investigationArea ?? "Unknown"}

Previous investigation objective:
${previousInvestigationAttempt?.objective ?? "Unknown"}

Previous question:
${previousInvestigationAttempt?.question ?? "Unknown"}

Previous investigation outcome:
${previousInvestigationAttempt?.outcome ?? "Unknown"}

New claim:
${claim.title}

Use a short natural transition when useful.
Do not return to the previous claim.
`

            : "No claim transition is currently required.";


    /*
     * ============================================================
     * Recent conversation
     * ============================================================
     *
     * Keep only the most recent three exchanges.
     *
     * The latest exchange is already included here, so we do not
     * send it a second time as a separate large block.
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
     * Latest conversation exchange
     * ============================================================
     *
     * A small explicit latest exchange makes the final question
     * strongly grounded in the candidate's most recent answer.
     */

    const latestTurn =
        interviewContext
            .conversationHistory
            .at(-1);


    const latestExchange =
        latestTurn
            ? {
                question:
                    latestTurn.question,

                answer:
                    latestTurn.answer ?? null,

                score:
                    latestTurn.score ?? null,

                feedback:
                    latestTurn.feedback ?? null,
            }
            : null;


    /*
     * ============================================================
     * Prompt-size logging
     * ============================================================
     */

    const promptSections = {
        stageContext:
            JSON.stringify(
                stageContext
            ).length,

        currentQuestionNumber:
            String(
                interviewContext
                    .sessionProgress
                    .currentQuestionIndex + 1
            ).length,

        resumeContext:
            interviewContext
                .resumeContext
                .length,

        recentConversation:
            JSON.stringify(
                recentConversation
            ).length,

        latestExchange:
            JSON.stringify(
                latestExchange
            ).length,

        claim:
            JSON.stringify(
                claim
            ).length,

        assessment:
            JSON.stringify(
                assessment
            ).length,

        claimProgress:
            JSON.stringify(
                claimProgress ?? null
            ).length,

        investigationAttempts:
            JSON.stringify(
                investigationAttempts
            ).length,

        decision:
            JSON.stringify(
                decision
            ).length,

        reasoning:
            JSON.stringify(
                reasoning
            ).length,

        investigationIntent:
            JSON.stringify(
                investigationIntent
            ).length,

        transitionContext:
            transitionContext.length,
    };


    console.log(
        "[InterviewPromptSize]",
        promptSections
    );


    /*
     * ============================================================
     * Final prompt
     * ============================================================
     */

    return `
# CURRENT INTERVIEW STAGE

${JSON.stringify(
    stageContext,
    null,
    2
)}

# CURRENT QUESTION NUMBER

${interviewContext
    .sessionProgress
    .currentQuestionIndex + 1}

# RELEVANT RESUME CONTEXT

${interviewContext.resumeContext}

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

# LATEST CONVERSATION EXCHANGE

${
    latestExchange
        ? JSON.stringify(
            latestExchange,
            null,
            2
        )
        : "No previous interview exchange."
}

# CURRENT RESUME CLAIM

${JSON.stringify(
    claim,
    null,
    2
)}

# CURRENT CLAIM ASSESSMENT

${JSON.stringify(
    assessment,
    null,
    2
)}

# CURRENT CLAIM PROGRESS

${JSON.stringify(
    claimProgress ?? null,
    null,
    2
)}

# INVESTIGATION ATTEMPTS

${
    investigationAttempts.length === 0
        ? "No previous investigation attempts for this claim."
        : JSON.stringify(
            investigationAttempts,
            null,
            2
        )
}

# INTERVIEW BRAIN DECISION

${JSON.stringify(
    decision,
    null,
    2
)}

# INVESTIGATION STRATEGY

Reasoning:
${reasoning.reasoning}

Objective:
${reasoning.objective}

Investigation Area:
${reasoning.investigationArea}

Question Type:
${reasoning.questionType}

Stay On Current Topic:
${reasoning.stayOnCurrentTopic}

Increase Difficulty:
${reasoning.increaseDifficulty}

Reference Resume:
${reasoning.referenceResume}

Ask Implementation Question:
${reasoning.askImplementationQuestion}

# INVESTIGATION INTENT

${JSON.stringify(
    investigationIntent,
    null,
    2
)}

# TRANSITION CONTEXT

${transitionContext}

# INSTRUCTIONS

Generate exactly ONE natural technical interview question.

Follow the supplied Interview Brain Decision exactly.

Follow the supplied Investigation Intent exactly.

Follow the supplied Investigation Strategy exactly.

Use the Current Resume Claim as the investigation target.

Use the candidate's latest answer as the strongest conversational signal.

Use Recent Conversation and Investigation Attempts to avoid
repeating questions or failed investigation approaches.

Use Relevant Resume Context only when the supplied strategy
requires resume reference.

Do not invent resume information, experience, technologies,
responsibilities, or implementation details.

Do not change the supplied claim.

Do not change the supplied investigation area.

Do not change the supplied objective.

Do not override the Brain decision.

Do not generate multiple questions.

Return only the structured question object required by the schema.
`;
};
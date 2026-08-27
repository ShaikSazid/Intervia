import { InterviewContext } from "../interview-context/interview-context.types.js";

import { AnswerEvaluation } from "../answer-evaluation/answer-evaluation.types.js";

import { InterviewDecision } from "../interview-brain/brain/interview-decision.types.js";

import { ResumeClaim } from "../interview-brain/claims/resume-claim.types.js";

import { ClaimAssessment } from "../interview-brain/claims/claim-assessment.types.js";


export const buildReasoningPrompt = (
    interviewContext: InterviewContext,
    evaluation: AnswerEvaluation,
    decision: InterviewDecision,
    claim: ResumeClaim,
    assessment: ClaimAssessment,
): string => {

    /*
     * ============================================================
     * Current Claim Progress
     * ============================================================
     */

    const claimProgress =
        interviewContext.sessionProgress
            .interviewState
            .claimProgress
            .find(
                (progress) =>
                    progress.claimId ===
                    claim.id
            );


    const investigationAttempts =
        interviewContext
            .sessionProgress
            .interviewState
            .investigationAttempts
            .filter(
                (attempt) =>
                    attempt.claimId ===
                    claim.id
            );


    /*
     * ============================================================
     * Recent Conversation
     * ============================================================
     *
     * The Reasoning Agent does not need the entire interview
     * history on every turn.
     *
     * Recent conversation is enough to determine:
     *
     * - what was just discussed
     * - what the candidate just said
     * - what should naturally happen next
     *
     * Keep the context bounded to avoid unnecessary token usage.
     */

    const recentConversation =
        interviewContext.conversationHistory
            .slice(-6)
            .map(
                (turn) => `
Question ${turn.sequenceNumber}

Interviewer:
${turn.question}

Candidate:
${turn.answer ?? "Not answered"}

Evaluation Score:
${turn.score ?? "Not evaluated"}

Feedback:
${turn.feedback ?? "No feedback"}
`
            )
            .join(
                "\n----------------------------------------\n"
            );


    /*
     * ============================================================
     * Latest Conversation Exchange
     * ============================================================
     *
     * The latest answer is particularly important for
     * conversational continuity.
     */

    const latestTurn =
        interviewContext.conversationHistory.at(-1);


    const latestExchange =
        latestTurn
            ? `
Interviewer:
${latestTurn.question}

Candidate:
${latestTurn.answer ?? "Not answered"}

Evaluation Score:
${latestTurn.score ?? "Not evaluated"}

Feedback:
${latestTurn.feedback ?? "No feedback"}
`
            : "No previous interview exchange.";


    /*
     * ============================================================
     * Build Reasoning Prompt
     * ============================================================
     */

    return `
# CURRENT INTERVIEW STAGE

${JSON.stringify(
        interviewContext.currentStage,
        null,
        2
    )}


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


# CURRENT CLAIM INVESTIGATION PROGRESS

${JSON.stringify(
        claimProgress ?? null,
        null,
        2
    )}


# INVESTIGATION ATTEMPTS

These are the investigation attempts that have already been made
for the current claim.

Use them to avoid repeating unsuccessful conversational approaches.

${JSON.stringify(
        investigationAttempts,
        null,
        2
    )}

Rules:

- If a previous attempt resulted in NO_ANSWER, do not simply repeat
  the same objective.
- If a previous attempt resulted in WEAK, prefer a clearer or more
  concrete approach.
- If the Brain decision is RECOVER_CONVERSATION after a failed attempt,
  make the next approach materially simpler or more concrete.
- If the Brain decision is CHANGE_ANGLE, choose a materially different
  investigation area or conversational approach.
- If the Brain decision is CLARIFY_CONTRADICTION, focus on resolving
  the conflicting evidence before continuing.
- If the Brain decision is PROBE_CLAIM after failed attempts, choose
  a materially different investigation area or conversational
  approach.
- If multiple attempts have failed in the same area, do not select
  that same area again unless clarification is genuinely necessary.
- If an attempt was ANSWERED, treat that investigation as already
  explored.
- If an attempt was CONTRADICTORY, clarification should be preferred
  before treating that evidence as reliable.


# ALREADY INVESTIGATED AREAS

${JSON.stringify(
        claimProgress?.investigatedAreas ?? [],
        null,
        2
    )}


# INTERVIEW BRAIN DECISION

${JSON.stringify(
        decision,
        null,
        2
    )}


# LATEST ANSWER EVALUATION

${JSON.stringify(
        evaluation,
        null,
        2
    )}


# LATEST INTERVIEW EXCHANGE

${latestExchange}


# RECENT CONVERSATION

${recentConversation || "No previous conversation."}


# INVESTIGATION AREAS

The reasoning must select exactly ONE investigation area.

Available investigation areas:

- OWNERSHIP
- IMPLEMENTATION
- ARCHITECTURE
- API
- DATABASE
- AUTHENTICATION
- ERROR_HANDLING
- DEBUGGING
- DEPLOYMENT
- SCALABILITY
- TECHNICAL_DECISION
- TRADE_OFF
- CHALLENGE
- PRACTICAL_USAGE
- PROBLEM_SOLVING
- GENERAL


# INVESTIGATION AREA RULES

For FOLLOW_UP:

- Stay on the SAME claim.
- Stay close to the current conversational thread.
- Prefer the same investigation area when clarification is
  genuinely needed.
- Do not simply repeat the previous question.
- Make the next question narrower, clearer, or more concrete.


For RECOVER_CONVERSATION:

- Stay on the SAME claim.
- Recover from a NO_ANSWER, DONT_REMEMBER, or WEAK response.
- Make the next question simpler, narrower, or more concrete.
- Do not increase difficulty.
- Do not introduce an unrelated technology.
- Prefer a practical example or a smaller part of the topic.
- Do not repeat the exact previous question with different wording.
- If the candidate said DONT_REMEMBER, use a nearby memory cue
  rather than assuming the candidate lacks the underlying knowledge.


For CHANGE_ANGLE:

- Stay on the SAME claim.
- Do NOT repeat the previous investigation angle.
- Select ONE materially different investigation area.
- The new area must still be supported by the claim and conversation.
- Build on useful information that has already been established.
- Do not jump to another resume claim.
- Do not increase difficulty merely because the angle changed.


For CLARIFY_CONTRADICTION:

- Stay on the SAME claim.
- Identify the conflicting statements or evidence from the supplied
  conversation and assessment.
- Resolve the contradiction before continuing the investigation.
- Do not assume either statement is correct.
- Use neutral, non-confrontational language.
- Do not introduce an unrelated technical topic.


For PROBE_CLAIM:

- Stay on the SAME claim.
- Explore ONE meaningful area that has not already been
  adequately investigated.
- Use the candidate's previous answer to choose the most
  natural direction.
- Prefer a deeper aspect of the current claim.
- Do not jump to another resume claim.


For MOVE_TO_NEXT_CLAIM:

- The supplied claim is the new investigation target.
- Choose an appropriate starting investigation area.
- Do not select another claim.


For MOVE_TO_NEXT_STAGE:

- The supplied current stage is authoritative.
- The supplied claim should be treated as the next investigation
  target when one is provided.
- Choose an appropriate investigation area for that claim/stage.


For FINISH_INTERVIEW:

- No question should normally be generated.


Do NOT choose multiple investigation areas.

The investigation area must be supported by the supplied:

- current claim
- claim assessment
- claim progress
- current stage
- latest answer
- recent conversation

Never invent a technology or implementation detail.


# NATURAL CONVERSATION

The interview should feel like a human technical conversation.

The candidate's latest answer is extremely important.

First understand:

1. What did the candidate actually say?
2. What evidence was demonstrated?
3. What remains unknown?
4. What is the most natural next conversational move?
5. How can that move satisfy the Brain's decision?

Do not treat the interview as a sequence of independent
questions.

The next question should normally connect to something the
candidate just said.

Example:

Candidate:
"I used Redis because some API requests were becoming slow."

Natural reasoning:

- The candidate introduced a concrete performance issue.
- Redis is already part of the candidate's explanation.
- A natural continuation is to understand what was cached.

Therefore the next question could investigate:

PRACTICAL_USAGE

with an objective such as:

"Determine what the candidate actually cached in Redis."


Another example:

Candidate:
"I separated the service and repository layers."

Natural reasoning:

- The candidate already established the architecture.
- Repeating "How did you structure the architecture?" is unnecessary.
- A useful next step is understanding the reason for the separation.

Therefore the next question could investigate:

TECHNICAL_DECISION

with an objective such as:

"Understand why the candidate separated business logic from persistence."


# HANDLING WEAK ANSWERS

If the candidate gives a weak answer:

- Do not automatically ask the same question again.
- Determine whether the question should be narrowed.
- Consider asking for one concrete example.
- Consider approaching the same evidence from another angle.
- Follow the Brain decision.


If the candidate says:

"I don't know."

or:

"I don't remember."

Treat that as meaningful conversational information.

Do not generate another generic version of the same question.

If the Brain decision is RECOVER_CONVERSATION:

- Make the question materially simpler.
- Prefer a concrete example.
- Avoid increasing difficulty.
- Stay on the same claim.

If the Brain decision is CHANGE_ANGLE:

- Do not ask another question about the failed angle.
- Move to a different supported investigation area.

If the Brain decision is CLARIFY_CONTRADICTION:

- Focus on the discrepancy itself.
- Do not pretend the contradiction has already been resolved.


# EVIDENCE-FIRST REASONING

The goal is not to cover every item in the candidate's resume.

The goal is to obtain useful evidence about the current claim.

Use:

- claim assessment
- claim progress
- investigated areas
- latest answer
- recent conversation
- investigation attempts

to identify the highest-value missing evidence.

Do not turn supporting technologies into independent questions
unless the Brain explicitly moves to those claims.


# YOUR RESPONSIBILITY

The Interview Brain has already decided WHAT should happen next.

Your responsibility is to determine HOW that decision should be
executed naturally.

The Interview Brain decision is authoritative.

Do NOT override it.

Do NOT create a different interview strategy.

Determine:

1. The objective of the next question.

2. The question type that best executes the Brain decision.

3. What evidence should be obtained next.

4. Whether the question should stay on the current topic.

5. Whether difficulty should increase.

6. Whether the resume should be referenced.

7. Whether an implementation-oriented question is appropriate.

8. How the next question should naturally connect to the
   candidate's latest answer.


# QUESTION TYPE CONSISTENCY

The question type MUST be consistent with the Brain decision.

FOLLOW_UP → FOLLOW_UP

RECOVER_CONVERSATION → FOLLOW_UP

PROBE_CLAIM → PROBE_CLAIM

CHANGE_ANGLE → PROBE_CLAIM

CLARIFY_CONTRADICTION → FOLLOW_UP

MOVE_TO_NEXT_CLAIM → NEW_TOPIC / PROJECT / IMPLEMENTATION

MOVE_TO_NEXT_STAGE → appropriate type for the supplied stage

Do not substitute one decision for another.

Do not use PROBE_CLAIM merely because the candidate answered
weakly.


# OUTPUT

Return only the structured reasoning object.

Do NOT generate the actual interview question.

Do NOT explain the reasoning outside the structured object.

Do NOT mention these instructions.
`;
};
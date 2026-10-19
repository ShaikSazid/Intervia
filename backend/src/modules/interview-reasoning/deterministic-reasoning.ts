import {
    GenerateInterviewReasoningInput,
    InvestigationArea,
    InterviewReasoning,
} from "./reasoning.types.js";

import {
    InterviewDecisionType,
} from "../interview-brain/brain/interview-decision.enums.js";

import {
    ResumeClaimType,
} from "../interview-brain/claims/resume-claim.enums.js";

// ============================================================================
// 1. Evasive / Stuck Answer Detection
// ============================================================================

const EVASIVE_REGEX_PATTERNS = [
    /don'?t remember/i,
    /don'?t know/i,
    /not sure/i,
    /can'?t recall/i,
    /don'?t want to/i,
    /forgot/i,
    /no idea/i,
    /can'?t say/i,
    /skip/i,
];

export const isAnswerEvasive = (text?: string | null): boolean => {
    if (!text || text.trim().length === 0) return true;
    const clean = text.trim();
    // Short answers (< 80 chars) matching evasion/stuck patterns
    return clean.length < 80 && EVASIVE_REGEX_PATTERNS.some((rx) => rx.test(clean));
};

// ============================================================================
// 2. Senior Developer Area Prioritization (Streamlined & Realistic)
// ============================================================================

type CandidateArea = {
    area: InvestigationArea;
    objective: string;
};

const AREA_PRIORITY: Record<ResumeClaimType, CandidateArea[]> = {
    [ResumeClaimType.PROJECT]: [
        {
            area: "OWNERSHIP",
            objective: "Clarify what the candidate personally built versus what the broader team or existing boilerplate provided.",
        },
        {
            area: "ARCHITECTURE",
            objective: "Explore high-level system structure, data flow between services, and key boundaries.",
        },
        {
            area: "TRADE_OFF",
            objective: "Examine why specific technologies were chosen over alternatives and what tradeoffs emerged.",
        },
        {
            area: "DEBUGGING",
            objective: "Explore how unexpected edge cases, bottlenecks, or production bugs were diagnosed and resolved.",
        },
        {
            area: "IMPLEMENTATION",
            objective: "Dig into the concrete mechanics of the most critical workflow or endpoint.",
        },
        {
            area: "DATABASE",
            objective: "Understand schema design, indexing choices, or consistency tradeoffs.",
        },
        {
            area: "API",
            objective: "Explore contract design, error handling conventions, and integration points.",
        },
    ],

    [ResumeClaimType.WORK_EXPERIENCE]: [
        {
            area: "OWNERSHIP",
            objective: "Identify the candidate's direct contributions and core scope of responsibility in this role.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Discuss a challenging technical problem or system requirement they navigated.",
        },
        {
            area: "TRADE_OFF",
            objective: "Assess architectural decisions and tradeoffs made during delivery.",
        },
        {
            area: "DEBUGGING",
            objective: "Investigate operational incidents or complex bugs resolved in production.",
        },
    ],

    [ResumeClaimType.SKILL]: [
        {
            area: "PRACTICAL_USAGE",
            objective: "Understand how they apply this skill in production rather than textbook theory.",
        },
        {
            area: "TRADE_OFF",
            objective: "Evaluate their understanding of the boundaries, quirks, and tradeoffs of this tool/technology.",
        },
        {
            area: "DEBUGGING",
            objective: "Discuss tricky failure modes or debugging challenges encountered with this skill.",
        },
    ],

    [ResumeClaimType.CERTIFICATION]: [
        {
            area: "PRACTICAL_USAGE",
            objective: "Verify practical application of the concepts learned in real-world scenarios.",
        },
    ],

    [ResumeClaimType.ACHIEVEMENT]: [
        {
            area: "OWNERSHIP",
            objective: "Establish the candidate's direct personal involvement in driving this outcome.",
        },
    ],

    [ResumeClaimType.OPEN_SOURCE]: [
        {
            area: "OWNERSHIP",
            objective: "Establish the specific PRs, modules, or issues personally written and reviewed.",
        },
    ],

    [ResumeClaimType.RESEARCH]: [
        {
            area: "PROBLEM_SOLVING",
            objective: "Explore the core technical problem tackled and the candidate's methodology.",
        },
    ],

    [ResumeClaimType.PUBLICATION]: [
        {
            area: "OWNERSHIP",
            objective: "Establish the specific technical contribution made to the publication.",
        },
    ],

    [ResumeClaimType.LEADERSHIP]: [
        {
            area: "PROBLEM_SOLVING",
            objective: "Explore how technical disagreements or delivery blockers were navigated with peers.",
        },
    ],

    [ResumeClaimType.EDUCATION]: [
        {
            area: "PRACTICAL_USAGE",
            objective: "Discuss foundational engineering concepts applied to concrete projects.",
        },
    ],

    [ResumeClaimType.OTHER]: [
        {
            area: "PRACTICAL_USAGE",
            objective: "Explore how this background item connects to real engineering execution.",
        },
    ],
};

// ============================================================================
// 3. Helper Functions
// ============================================================================

const getAttemptedAreas = (
    interviewContext: GenerateInterviewReasoningInput["interviewContext"],
    claimId: string,
): Set<InvestigationArea> => {
    return new Set(
        interviewContext.sessionProgress.interviewState.investigationAttempts
            .filter((attempt) => attempt.claimId === claimId)
            .map((attempt) => attempt.investigationArea),
    );
};

const getLatestAttempt = (
    interviewContext: GenerateInterviewReasoningInput["interviewContext"],
    claimId: string,
) => {
    const attempts =
        interviewContext.sessionProgress.interviewState.investigationAttempts
            .filter((attempt) => attempt.claimId === claimId);

    return attempts.at(-1) ?? null;
};

const getPreferredArea = (
    claimType: ResumeClaimType,
    attemptedAreas: Set<InvestigationArea>,
): CandidateArea => {
    const candidates =
        AREA_PRIORITY[claimType] ?? AREA_PRIORITY[ResumeClaimType.OTHER];

    return (
        candidates.find(
            (candidate) => !attemptedAreas.has(candidate.area),
        ) ?? candidates[0]!
    );
};

const getNextDifferentArea = (
    claimType: ResumeClaimType,
    attemptedAreas: Set<InvestigationArea>,
    latestArea: InvestigationArea | null,
): CandidateArea => {
    const candidates =
        AREA_PRIORITY[claimType] ?? AREA_PRIORITY[ResumeClaimType.OTHER];

    const differentUnattempted = candidates.find(
        (candidate) =>
            !attemptedAreas.has(candidate.area) && candidate.area !== latestArea,
    );

    if (differentUnattempted) return differentUnattempted;

    const different = candidates.find(
        (candidate) => candidate.area !== latestArea,
    );

    if (different) return different;

    return getPreferredArea(claimType, attemptedAreas);
};

const chooseQuestionType = (
    decision: InterviewDecisionType,
    claimType: ResumeClaimType,
): InterviewReasoning["questionType"] => {
    switch (decision) {
        case InterviewDecisionType.FOLLOW_UP:
        case InterviewDecisionType.RECOVER_CONVERSATION:
        case InterviewDecisionType.CLARIFY_CONTRADICTION:
            return "FOLLOW_UP";

        case InterviewDecisionType.PROBE_CLAIM:
        case InterviewDecisionType.CHANGE_ANGLE:
            return "PROBE_CLAIM";

        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:
        case InterviewDecisionType.MOVE_TO_NEXT_STAGE:
            if (claimType === ResumeClaimType.PROJECT) return "PROJECT";
            if (claimType === ResumeClaimType.SKILL) return "IMPLEMENTATION";
            return "NEW_TOPIC";

        default:
            return "FOLLOW_UP";
    }
};

const buildObjective = (
    decision: InterviewDecisionType,
    selectedArea: CandidateArea,
    latestAttempt: ReturnType<typeof getLatestAttempt>,
    isStumped: boolean,
): string => {
    switch (decision) {
        case InterviewDecisionType.FOLLOW_UP:
            return latestAttempt?.objective ?? selectedArea.objective;

        case InterviewDecisionType.RECOVER_CONVERSATION:
            if (isStumped) {
                return "The candidate drew a blank or forgot specifics. Zoom out to a high-level architectural view or hypothetical design question so they can answer comfortably without recalling legacy code details.";
            }
            return `Lower cognitive load with a concrete, accessible angle. ${selectedArea.objective}`;

        case InterviewDecisionType.CLARIFY_CONTRADICTION:
            return "Politely and constructively clarify the conflicting technical detail without putting the candidate on the defensive.";

        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:
            return `Transition smoothly to the new claim. Establish foundational context on ${selectedArea.area}.`;

        default:
            return selectedArea.objective;
    }
};

const getReasoningText = (
    decision: InterviewDecisionType,
    selectedArea: CandidateArea,
    isStumped: boolean,
): string => {
    switch (decision) {
        case InterviewDecisionType.FOLLOW_UP:
            return "Follow up on the active technical thread naturally as a senior peer.";

        case InterviewDecisionType.RECOVER_CONVERSATION:
            if (isStumped) {
                return "Candidate couldn't recall details. Bridge warmly and ask a high-level question to keep conversational momentum.";
            }
            return "Provide a friendly entry point to keep the conversation flowing smoothly.";

        case InterviewDecisionType.PROBE_CLAIM:
            return "Explore technical reasoning, engineering tradeoffs, or real-world failure modes.";

        case InterviewDecisionType.CHANGE_ANGLE:
            return `Pivot investigation towards ${selectedArea.area} to test a different practical dimension.`;

        case InterviewDecisionType.CLARIFY_CONTRADICTION:
            return "Clarify apparent inconsistency with curious, neutral phrasing.";

        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:
            return "Acknowledge previous topic and start a fresh inquiry into the next claim.";

        case InterviewDecisionType.MOVE_TO_NEXT_STAGE:
            return "Advance to the next interview stage seamlessly.";

        default:
            return `Explore ${selectedArea.area} in a collaborative senior peer manner.`;
    }
};

// ============================================================================
// 4. Main Export
// ============================================================================

export const buildDeterministicReasoning = (
    input: GenerateInterviewReasoningInput,
): InterviewReasoning => {
    const {
        interviewContext,
        decision,
        claim,
        assessment,
        evaluation,
    } = input;

    const attemptedAreas = getAttemptedAreas(interviewContext, claim.id);
    const latestAttempt = getLatestAttempt(interviewContext, claim.id);
    const latestArea = latestAttempt?.investigationArea ?? null;

    // Check if the candidate's last answer was a blank / evasive response
    const lastAnswer = interviewContext.conversationHistory?.at(-1)?.answer ?? "";
    const candidateIsStumped = isAnswerEvasive(lastAnswer);

    let selectedArea: CandidateArea;

    switch (decision.type) {
        case InterviewDecisionType.FOLLOW_UP:
        case InterviewDecisionType.RECOVER_CONVERSATION:
        case InterviewDecisionType.CLARIFY_CONTRADICTION:
            selectedArea = latestAttempt
                ? {
                    area: latestAttempt.investigationArea,
                    objective: latestAttempt.objective,
                }
                : getPreferredArea(claim.type, attemptedAreas);
            break;

        case InterviewDecisionType.CHANGE_ANGLE:
            selectedArea = getNextDifferentArea(
                claim.type,
                attemptedAreas,
                latestArea,
            );
            break;

        case InterviewDecisionType.PROBE_CLAIM:
        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:
        case InterviewDecisionType.MOVE_TO_NEXT_STAGE:
        default:
            selectedArea = getPreferredArea(claim.type, attemptedAreas);
            break;
    }

    const questionType = chooseQuestionType(decision.type, claim.type);
    const objective = buildObjective(
        decision.type,
        selectedArea,
        latestAttempt,
        candidateIsStumped,
    );

    const weakAnswer = evaluation.answerBehavior === "WEAK" || candidateIsStumped;
    const recoverDecision = decision.type === InterviewDecisionType.RECOVER_CONVERSATION;

    // Only increase difficulty when candidate answers confidently with depth
    const increaseDifficulty =
        !recoverDecision &&
        !weakAnswer &&
        (assessment.confidence >= 0.70 || evaluation.score >= 8);

    const askImplementationQuestion =
        questionType === "IMPLEMENTATION" ||
        selectedArea.area === "IMPLEMENTATION";

    return {
        reasoning: getReasoningText(decision.type, selectedArea, candidateIsStumped),
        objective,
        investigationArea: selectedArea.area,
        questionType,
        stayOnCurrentTopic:
            decision.type !== InterviewDecisionType.MOVE_TO_NEXT_CLAIM &&
            decision.type !== InterviewDecisionType.MOVE_TO_NEXT_STAGE,
        increaseDifficulty,
        referenceResume: true,
        askImplementationQuestion,
    };
};
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

type CandidateArea = {
    area: InvestigationArea;
    objective: string;
};

const AREA_PRIORITY: Record<ResumeClaimType, CandidateArea[]> = {
    [ResumeClaimType.PROJECT]: [
        {
            area: "OWNERSHIP",
            objective: "Establish what the candidate personally owned and implemented in the project.",
        },
        {
            area: "IMPLEMENTATION",
            objective: "Establish how the claimed project functionality was actually implemented.",
        },
        {
            area: "ARCHITECTURE",
            objective: "Establish the architectural design and structure behind the claimed project.",
        },
        {
            area: "TECHNICAL_DECISION",
            objective: "Establish the important technical decisions made for the project and why they were chosen.",
        },
        {
            area: "DATABASE",
            objective: "Establish how data storage and database decisions supported the project.",
        },
        {
            area: "API",
            objective: "Establish how APIs were designed and used in the project.",
        },
        {
            area: "AUTHENTICATION",
            objective: "Establish how authentication and access control were implemented when relevant.",
        },
        {
            area: "ERROR_HANDLING",
            objective: "Establish how failures and error conditions were handled in the project.",
        },
        {
            area: "DEBUGGING",
            objective: "Establish how the candidate diagnosed and resolved technical problems.",
        },
        {
            area: "DEPLOYMENT",
            objective: "Establish how the project was deployed and operated.",
        },
        {
            area: "SCALABILITY",
            objective: "Establish how the project would handle increased load or usage.",
        },
        {
            area: "TRADE_OFF",
            objective: "Establish important trade-offs behind the candidate's technical choices.",
        },
        {
            area: "CHALLENGE",
            objective: "Establish a significant technical challenge encountered during the project.",
        },
        {
            area: "PRACTICAL_USAGE",
            objective: "Establish how the claimed solution was used in practice.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate approached and solved a concrete project problem.",
        },
        {
            area: "GENERAL",
            objective: "Establish additional concrete evidence supporting the project claim.",
        },
    ],

    [ResumeClaimType.WORK_EXPERIENCE]: [
        {
            area: "OWNERSHIP",
            objective: "Establish what the candidate personally owned in the claimed work experience.",
        },
        {
            area: "PRACTICAL_USAGE",
            objective: "Establish how the claimed skills were applied in real work.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate solved a real problem in this experience.",
        },
        {
            area: "IMPLEMENTATION",
            objective: "Establish how the candidate implemented the claimed work.",
        },
        {
            area: "TECHNICAL_DECISION",
            objective: "Establish important technical decisions made during the work.",
        },
        {
            area: "CHALLENGE",
            objective: "Establish a significant challenge faced during the work.",
        },
        {
            area: "ARCHITECTURE",
            objective: "Establish the architecture relevant to the claimed work.",
        },
        {
            area: "DEBUGGING",
            objective: "Establish how technical issues were diagnosed and resolved.",
        },
        {
            area: "ERROR_HANDLING",
            objective: "Establish how failures and error conditions were handled.",
        },
        {
            area: "DEPLOYMENT",
            objective: "Establish deployment or operational responsibilities.",
        },
        {
            area: "SCALABILITY",
            objective: "Establish how the solution handled growth or increased load.",
        },
        {
            area: "TRADE_OFF",
            objective: "Establish important trade-offs in the candidate's decisions.",
        },
        {
            area: "GENERAL",
            objective: "Establish additional concrete evidence supporting the work claim.",
        },
    ],

    [ResumeClaimType.SKILL]: [
        {
            area: "IMPLEMENTATION",
            objective: "Establish whether the candidate can practically implement solutions using this skill.",
        },
        {
            area: "PRACTICAL_USAGE",
            objective: "Establish how the candidate has used this skill in practice.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate uses this skill to solve technical problems.",
        },
        {
            area: "DEBUGGING",
            objective: "Establish the candidate's ability to debug using this skill.",
        },
        {
            area: "ARCHITECTURE",
            objective: "Establish the candidate's understanding of architectural use of this skill.",
        },
        {
            area: "TECHNICAL_DECISION",
            objective: "Establish when and why the candidate would choose this skill or technology.",
        },
        {
            area: "TRADE_OFF",
            objective: "Establish the candidate's understanding of trade-offs associated with this skill.",
        },
        {
            area: "GENERAL",
            objective: "Establish additional concrete evidence of competence with this skill.",
        },
    ],

    [ResumeClaimType.CERTIFICATION]: [
        {
            area: "GENERAL",
            objective: "Establish what the candidate understands and can explain from this certification.",
        },
        {
            area: "PRACTICAL_USAGE",
            objective: "Establish how the candidate has applied knowledge represented by this certification.",
        },
        {
            area: "IMPLEMENTATION",
            objective: "Establish whether the candidate can apply the relevant concepts in practice.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate would use the certification knowledge to solve a problem.",
        },
    ],

    [ResumeClaimType.ACHIEVEMENT]: [
        {
            area: "OWNERSHIP",
            objective: "Establish what the candidate personally did to achieve this result.",
        },
        {
            area: "CHALLENGE",
            objective: "Establish the challenge that had to be overcome.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate solved the problem behind the achievement.",
        },
        {
            area: "PRACTICAL_USAGE",
            objective: "Establish the practical context in which the achievement was produced.",
        },
        {
            area: "GENERAL",
            objective: "Establish concrete evidence supporting the achievement claim.",
        },
    ],

    [ResumeClaimType.OPEN_SOURCE]: [
        {
            area: "OWNERSHIP",
            objective: "Establish what the candidate personally contributed to the open-source work.",
        },
        {
            area: "IMPLEMENTATION",
            objective: "Establish how the candidate implemented the claimed contribution.",
        },
        {
            area: "DEBUGGING",
            objective: "Establish how the candidate diagnosed and resolved issues in the contribution.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate solved the problem addressed by the contribution.",
        },
        {
            area: "TECHNICAL_DECISION",
            objective: "Establish important technical decisions made in the contribution.",
        },
        {
            area: "CHALLENGE",
            objective: "Establish the main technical challenge encountered.",
        },
        {
            area: "GENERAL",
            objective: "Establish additional concrete evidence supporting the contribution claim.",
        },
    ],

    [ResumeClaimType.RESEARCH]: [
        {
            area: "OWNERSHIP",
            objective: "Establish the candidate's specific contribution to the research.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate approached the research problem.",
        },
        {
            area: "TECHNICAL_DECISION",
            objective: "Establish important methodological or technical decisions.",
        },
        {
            area: "IMPLEMENTATION",
            objective: "Establish how the research approach was implemented.",
        },
        {
            area: "CHALLENGE",
            objective: "Establish the main research or technical challenge.",
        },
        {
            area: "GENERAL",
            objective: "Establish additional concrete evidence supporting the research claim.",
        },
    ],

    [ResumeClaimType.PUBLICATION]: [
        {
            area: "OWNERSHIP",
            objective: "Establish the candidate's specific contribution to the publication.",
        },
        {
            area: "GENERAL",
            objective: "Establish the core work and evidence behind the publication claim.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish the problem addressed by the work.",
        },
        {
            area: "TECHNICAL_DECISION",
            objective: "Establish important technical or methodological decisions.",
        },
        {
            area: "IMPLEMENTATION",
            objective: "Establish how the proposed work was implemented when applicable.",
        },
    ],

    [ResumeClaimType.LEADERSHIP]: [
        {
            area: "OWNERSHIP",
            objective: "Establish what the candidate personally owned as a leader.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate handled a difficult leadership problem.",
        },
        {
            area: "CHALLENGE",
            objective: "Establish a significant challenge encountered while leading.",
        },
        {
            area: "PRACTICAL_USAGE",
            objective: "Establish how the candidate's leadership responsibilities worked in practice.",
        },
        {
            area: "GENERAL",
            objective: "Establish additional concrete evidence supporting the leadership claim.",
        },
    ],

    [ResumeClaimType.EDUCATION]: [
        {
            area: "GENERAL",
            objective: "Establish the candidate's understanding of the claimed educational knowledge.",
        },
        {
            area: "PRACTICAL_USAGE",
            objective: "Establish how the candidate applied knowledge gained through education.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate used this knowledge to solve a problem.",
        },
        {
            area: "IMPLEMENTATION",
            objective: "Establish whether the candidate can apply the claimed knowledge in practice.",
        },
    ],

    [ResumeClaimType.OTHER]: [
        {
            area: "GENERAL",
            objective: "Establish concrete evidence supporting the resume claim.",
        },
        {
            area: "OWNERSHIP",
            objective: "Establish what the candidate personally owned or contributed.",
        },
        {
            area: "PRACTICAL_USAGE",
            objective: "Establish how the claimed experience or skill was applied in practice.",
        },
        {
            area: "PROBLEM_SOLVING",
            objective: "Establish how the candidate handled a relevant problem.",
        },
    ],
};

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
        ) ??
        candidates[0]!
    );
};

const getNextDifferentArea = (
    claimType: ResumeClaimType,
    attemptedAreas: Set<InvestigationArea>,
    latestArea: InvestigationArea | null,
): CandidateArea => {
    const candidates =
        AREA_PRIORITY[claimType] ?? AREA_PRIORITY[ResumeClaimType.OTHER];

    const differentUnattempted =
        candidates.find(
            (candidate) =>
                !attemptedAreas.has(candidate.area) &&
                candidate.area !== latestArea,
        );

    if (differentUnattempted) {
        return differentUnattempted;
    }

    const different =
        candidates.find(
            (candidate) => candidate.area !== latestArea,
        );

    if (different) {
        return different;
    }

    return getPreferredArea(claimType, attemptedAreas);
};

const chooseQuestionType = (
    decision: InterviewDecisionType,
    claimType: ResumeClaimType,
): InterviewReasoning["questionType"] => {
    switch (decision) {
        case InterviewDecisionType.FOLLOW_UP:
            return "FOLLOW_UP";

        case InterviewDecisionType.RECOVER_CONVERSATION:
            return "FOLLOW_UP";

        case InterviewDecisionType.PROBE_CLAIM:
            return "PROBE_CLAIM";

        case InterviewDecisionType.CHANGE_ANGLE:
            return "PROBE_CLAIM";

        case InterviewDecisionType.CLARIFY_CONTRADICTION:
            return "FOLLOW_UP";

        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:
            if (claimType === ResumeClaimType.PROJECT) {
                return "PROJECT";
            }

            if (claimType === ResumeClaimType.SKILL) {
                return "IMPLEMENTATION";
            }

            return "NEW_TOPIC";

        case InterviewDecisionType.MOVE_TO_NEXT_STAGE:
            if (claimType === ResumeClaimType.PROJECT) {
                return "PROJECT";
            }

            if (claimType === ResumeClaimType.SKILL) {
                return "IMPLEMENTATION";
            }

            return "NEW_TOPIC";

        default:
            return "FOLLOW_UP";
    }
};

const buildObjective = (
    decision: InterviewDecisionType,
    selectedArea: CandidateArea,
    latestAttempt: ReturnType<typeof getLatestAttempt>,
): string => {
    switch (decision) {
        case InterviewDecisionType.FOLLOW_UP:
            return latestAttempt?.objective ??
                selectedArea.objective;

        case InterviewDecisionType.RECOVER_CONVERSATION:
            return `Clarify the current claim using a simpler and more concrete approach. ${selectedArea.objective}`;

        case InterviewDecisionType.CLARIFY_CONTRADICTION:
            return "Resolve the conflicting evidence in the candidate's previous response and the resume-backed claim.";

        default:
            return selectedArea.objective;
    }
};

const getReasoningText = (
    decision: InterviewDecisionType,
    selectedArea: CandidateArea,
): string => {
    switch (decision) {
        case InterviewDecisionType.FOLLOW_UP:
            return "Continue the current conversational thread and investigate the same claim.";

        case InterviewDecisionType.RECOVER_CONVERSATION:
            return "Simplify the investigation and use a concrete approach to recover the conversation.";

        case InterviewDecisionType.PROBE_CLAIM:
            return "Deepen investigation of the current claim using the highest-value available evidence area.";

        case InterviewDecisionType.CHANGE_ANGLE:
            return "Investigate the current claim from a different evidence area.";

        case InterviewDecisionType.CLARIFY_CONTRADICTION:
            return "Focus on resolving the conflicting evidence before continuing the investigation.";

        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:
            return "Begin investigation of the newly selected resume claim.";

        case InterviewDecisionType.MOVE_TO_NEXT_STAGE:
            return "Begin investigation of the newly selected stage and claim.";

        default:
            return `Investigate the current claim through ${selectedArea.area}.`;
    }
};

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

    const attemptedAreas =
        getAttemptedAreas(interviewContext, claim.id);

    const latestAttempt =
        getLatestAttempt(interviewContext, claim.id);

    const latestArea =
        latestAttempt?.investigationArea ?? null;

    let selectedArea: CandidateArea;

    switch (decision.type) {
        case InterviewDecisionType.FOLLOW_UP:
            selectedArea = latestAttempt
                ? {
                    area: latestAttempt.investigationArea,
                    objective: latestAttempt.objective,
                }
                : getPreferredArea(claim.type, attemptedAreas);
            break;

        case InterviewDecisionType.RECOVER_CONVERSATION:
            selectedArea = latestAttempt
                ? {
                    area: latestAttempt.investigationArea,
                    objective: latestAttempt.objective,
                }
                : getPreferredArea(claim.type, attemptedAreas);
            break;

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
            selectedArea = getPreferredArea(
                claim.type,
                attemptedAreas,
            );
            break;

        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:
        case InterviewDecisionType.MOVE_TO_NEXT_STAGE:
        default:
            selectedArea = getPreferredArea(
                claim.type,
                attemptedAreas,
            );
            break;
    }

    const questionType =
        chooseQuestionType(
            decision.type,
            claim.type,
        );

    const objective =
        buildObjective(
            decision.type,
            selectedArea,
            latestAttempt,
        );

    const weakAnswer =
        evaluation.answerBehavior === "WEAK";

    const recoverDecision =
        decision.type ===
        InterviewDecisionType.RECOVER_CONVERSATION;

    const increaseDifficulty =
        !recoverDecision &&
        !weakAnswer &&
        (
            assessment.confidence >= 0.70 ||
            evaluation.score >= 8
        );

    const askImplementationQuestion =
        questionType === "IMPLEMENTATION" ||
        selectedArea.area === "IMPLEMENTATION";

    return {
        reasoning: getReasoningText(
            decision.type,
            selectedArea,
        ),

        objective,

        investigationArea:
            selectedArea.area,

        questionType,

        stayOnCurrentTopic:
            decision.type !==
            InterviewDecisionType.MOVE_TO_NEXT_CLAIM &&
            decision.type !==
            InterviewDecisionType.MOVE_TO_NEXT_STAGE,

        increaseDifficulty,

        referenceResume:
            true,

        askImplementationQuestion,
    };
};
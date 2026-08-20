import {
    InterviewDecision,
} from "../brain/interview-decision.types.js";

import {
    InterviewDecisionType,
} from "../brain/interview-decision.enums.js";

import {
    ClaimAssessment,
} from "../claims/claim-assessment.types.js";

import {
    ResumeClaim,
} from "../claims/resume-claim.types.js";

import {
    InterviewReasoning,
} from "../../interview-reasoning/reasoning.types.js";

import {
    InvestigationIntent,
    ConversationDirective,
} from "./investigation-intent.types.js";


const getConversationDirective = (
    decision: InterviewDecisionType
): ConversationDirective => {

    switch (decision) {

        case InterviewDecisionType.FOLLOW_UP:
            return "CLARIFY";

        case InterviewDecisionType.PROBE_CLAIM:
            return "DEEPEN";

        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:
            return "TRANSITION";

        case InterviewDecisionType.MOVE_TO_NEXT_STAGE:
            return "TRANSITION";

        case InterviewDecisionType.FINISH_INTERVIEW:
            return "TRANSITION";

        default: {
            const exhaustiveCheck: never = decision;
            return exhaustiveCheck;
        }
    }
};


const buildRequiredEvidence = (
    reasoning: InterviewReasoning,
    assessment: ClaimAssessment
): string[] => {

    const evidence: string[] = [];

    if (reasoning.objective) {
        evidence.push(reasoning.objective);
    }

    if (reasoning.investigationArea) {
        evidence.push(
            `Evidence related to ${reasoning.investigationArea}`
        );
    }

    if (assessment.needsFollowUp) {
        evidence.push(
            "Clarification of the evidence that remains uncertain"
        );
    }

    return evidence;
};


export const buildInvestigationIntent = (
    decision: InterviewDecision,
    reasoning: InterviewReasoning,
    claim: ResumeClaim,
    assessment: ClaimAssessment,
    investigatedAreas: InvestigationIntent["investigatedAreas"]
): InvestigationIntent => {

    if (
        decision.claimId &&
        decision.claimId !== claim.id
    ) {
        throw new Error(
            `InvestigationIntent: decision claim "${decision.claimId}" does not match supplied claim "${claim.id}".`
        );
    }

    return {

        decision: decision.type,

        claimId: claim.id,

        objective:
            reasoning.objective,

        investigationArea:
            reasoning.investigationArea,

        requiredEvidence:
            buildRequiredEvidence(
                reasoning,
                assessment
            ),

        investigatedAreas,

        conversationDirective:
            getConversationDirective(
                decision.type
            ),

        assessment,

        claim,
    };
};
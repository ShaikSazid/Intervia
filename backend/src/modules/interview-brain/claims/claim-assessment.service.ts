import { AnswerEvaluation } from "../../answer-evaluation/answer-evaluation.types.js";
import { ClaimVerificationStatus } from "./claim-assessment.enums.js";
import { ClaimAssessment } from "./claim-assessment.types.js";

interface CreateClaimAssessmentInput {
    claimId: string;
    turnId: string;
    evaluation: AnswerEvaluation;
}

export const createClaimAssessment = (
    input: CreateClaimAssessmentInput
): ClaimAssessment => {

    const {
        claimId,
        turnId,
        evaluation,
    } = input;


    let verificationStatus: ClaimVerificationStatus;
    let confidence: number;
    let needsFollowUp: boolean;


    if (
        evaluation.score < 5 ||
        evaluation.followUpRequired
    ) {

        verificationStatus =
            ClaimVerificationStatus.QUESTIONABLE;

        confidence =
            Math.min(
                evaluation.score / 10,
                0.4
            );

        needsFollowUp = true;

    } else if (
        evaluation.score < 8
    ) {

        verificationStatus =
            ClaimVerificationStatus.PARTIALLY_VERIFIED;

        confidence =
            evaluation.score / 10;

        needsFollowUp = true;

    } else {

        verificationStatus =
            ClaimVerificationStatus.VERIFIED;

        confidence =
            evaluation.score / 10;

        needsFollowUp = false;
    }


    return {

        claimId,

        verificationStatus,

        confidence,

        evidenceTurnIds: [
            turnId,
        ],

        evidence: [
            {
                turnId,
                evaluation,
            },
        ],

        needsFollowUp,
    };
};
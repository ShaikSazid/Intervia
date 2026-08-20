import { ClaimAssessment } from "../claims/claim-assessment.types.js";
import { CandidateModel } from "./candidate-model.types.js";


export const updateCandidateModel = (
    candidateModel: CandidateModel,
    assessment: ClaimAssessment
): CandidateModel => {

    /*
     * Find the existing assessment for this claim.
     */
    const existingIndex =
        candidateModel.claimAssessments.findIndex(
            (existing: ClaimAssessment) =>
                existing.claimId ===
                assessment.claimId
        );


    /*
     * No previous assessment exists.
     *
     * This should normally not happen because the
     * Candidate Model is initialized with an assessment
     * for every claim, but we handle it safely.
     */
    if (existingIndex === -1) {

        return {

            ...candidateModel,

            claimAssessments: [
                ...candidateModel.claimAssessments,

                assessment,
            ],
        };
    }


    /*
     * Get the previous assessment.
     */
    const existingAssessment =
        candidateModel
            .claimAssessments[
                existingIndex
            ];


    /*
     * Preserve every evidence turn ID.
     *
     * Set removes duplicates.
     */
    const mergedEvidenceTurnIds = [
        ...new Set([
            ...existingAssessment.evidenceTurnIds,

            ...assessment.evidenceTurnIds,
        ]),
    ];


    /*
     * Merge detailed evidence.
     *
     * turnId is used as the unique identifier.
     *
     * If the same turn appears again,
     * the newest evidence replaces the old one.
     */
    const evidenceByTurnId =
        new Map<
            string,
            (typeof assessment.evidence)[number]
        >();


    /*
     * Add historical evidence first.
     */
    for (
        const evidence
        of existingAssessment.evidence
    ) {

        evidenceByTurnId.set(
            evidence.turnId,
            evidence
        );
    }


    /*
     * Add the newest evidence.
     *
     * This intentionally overwrites evidence
     * with the same turnId.
     */
    for (
        const evidence
        of assessment.evidence
    ) {

        evidenceByTurnId.set(
            evidence.turnId,
            evidence
        );
    }


    /*
     * Convert Map back into an array.
     */
    const mergedEvidence =
        Array.from(
            evidenceByTurnId.values()
        );


    /*
     * The latest assessment remains the
     * current truth.
     *
     * Historical evidence is preserved.
     */
    const updatedAssessment:
        ClaimAssessment = {

        ...assessment,

        evidenceTurnIds:
            mergedEvidenceTurnIds,

        evidence:
            mergedEvidence,
    };


    /*
     * Create a new assessment array.
     */
    const updatedAssessments = [
        ...candidateModel.claimAssessments,
    ];


    /*
     * Replace the old assessment.
     */
    updatedAssessments[
        existingIndex
    ] = updatedAssessment;


    /*
     * Return a new Candidate Model.
     */
    return {

        ...candidateModel,

        claimAssessments:
            updatedAssessments,
    };
};
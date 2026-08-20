import { InvestigationArea } from "../../interview-reasoning/reasoning.types.js";
import { ClaimProgress } from "./claim-progress.types.js";


const createInitialProgress = (
    claimId: string
): ClaimProgress => ({
    claimId,

    questionCount: 0,

    weakAnswerCount: 0,

    followUpCount: 0,

    probeCount: 0,
    investigatedAreas: []
});


export const getClaimProgress = (
    claimProgress: ClaimProgress[],
    claimId: string
): ClaimProgress => {

    return (
        claimProgress.find(
            (progress) =>
                progress.claimId === claimId
        )
        ??
        createInitialProgress(claimId)
    );
};


const updateClaim = (
    claimProgress: ClaimProgress[],
    claimId: string,
    updater: (
        current: ClaimProgress
    ) => ClaimProgress
): ClaimProgress[] => {

    const existingIndex =
        claimProgress.findIndex(
            (progress) =>
                progress.claimId === claimId
        );


    const current =
        existingIndex === -1
            ? createInitialProgress(claimId)
            : claimProgress[existingIndex];


    const updated =
        updater(current);


    if (existingIndex === -1) {

        return [
            ...claimProgress,
            updated,
        ];
    }


    const result =
        [...claimProgress];


    result[existingIndex] =
        updated;


    return result;
};


export const recordQuestion = (
    claimProgress: ClaimProgress[],
    claimId: string
): ClaimProgress[] => {

    return updateClaim(
        claimProgress,
        claimId,
        (current) => ({
            ...current,

            questionCount:
                current.questionCount + 1,
        })
    );
};


export const recordWeakAnswer = (
    claimProgress: ClaimProgress[],
    claimId: string
): ClaimProgress[] => {

    return updateClaim(
        claimProgress,
        claimId,
        (current) => ({
            ...current,

            weakAnswerCount:
                current.weakAnswerCount + 1,
        })
    );
};


export const recordFollowUp = (
    claimProgress: ClaimProgress[],
    claimId: string
): ClaimProgress[] => {

    return updateClaim(
        claimProgress,
        claimId,
        (current) => ({
            ...current,

            followUpCount:
                current.followUpCount + 1,
        })
    );
};


export const recordProbe = (
    claimProgress: ClaimProgress[],
    claimId: string
): ClaimProgress[] => {

    return updateClaim(
        claimProgress,
        claimId,
        (current) => ({
            ...current,

            probeCount:
                current.probeCount + 1,
        })
    );
};

export const recordInvestigationArea = (
    claimProgress: ClaimProgress[],
    claimId: string,
    area: InvestigationArea
): ClaimProgress[] => {

    return updateClaim(
        claimProgress,
        claimId,
        (current) => {

            if (
                current.investigatedAreas.includes(area)
            ) {
                return current;
            }

            return {
                ...current,

                investigatedAreas: [
                    ...current.investigatedAreas,
                    area,
                ],
            };
        }
    );
};
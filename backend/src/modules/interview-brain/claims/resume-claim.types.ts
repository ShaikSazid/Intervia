import {
    ResumeClaimType,
} from "./resume-claim.enums.js";


export interface ResumeClaim {

    id: string;

    title: string;

    type: ResumeClaimType;

    sourceSection: string | null;

    description: string | null;

    relatedSkillNames: string[];

    dateRange: string | null;
}
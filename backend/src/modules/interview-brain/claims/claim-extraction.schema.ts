import { z } from "zod";

import {
    ResumeClaimType,
} from "./resume-claim.enums.js";


export const resumeClaimSchema = z.object({

    id:
        z.string(),

    title:
        z.string(),

    type:
        z.enum(ResumeClaimType),

    sourceSection:
        z.string().nullable(),

    description:
        z.string().nullable(),

    relatedSkillNames:
        z.array(
            z.string()
        ),

    dateRange:
        z.string().nullable(),
});


export const resumeClaimsSchema =
    z.object({

        claims:
            z.array(
                resumeClaimSchema
            ),
    });


export type ResumeClaims =
    z.infer<
        typeof resumeClaimsSchema
    >;
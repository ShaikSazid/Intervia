import { zodResponseFormat } from "openai/helpers/zod";

import { openai } from "../../../lib/openai.js";


import { formatLLMError } from "../../../common/utils/llm-error.js";
import {
    resumeClaimsSchema,
} from "./claim-extraction.schema.js";

import {
    ExtractResumeClaimsInput,
    ExtractResumeClaimsResult,
} from "./claim-extraction.types.js";


const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_PROMPT = `
You are an expert Resume Claim Extraction Agent.

Your responsibility is to identify factual, interviewable claims
from a structured CandidateAnalysis.

The claims will later be used by an evidence-driven adaptive
interview system.

==================================================
CORE RULE
==================================================

ONLY extract information supported by the provided CandidateAnalysis.

NEVER invent:

- technologies
- projects
- companies
- achievements
- responsibilities
- certifications
- experience
- dates
- metrics
- ownership
- technical decisions

If information is not explicitly supported by the CandidateAnalysis,
do not include it.

==================================================
CLAIM TYPES
==================================================

Use the most appropriate claim type.

PROJECT:
A meaningful project or application.

WORK_EXPERIENCE:
Professional work, internship, employment, or meaningful
professional responsibility.

SKILL:
A technical or professional skill explicitly identified in
the candidate profile.

CERTIFICATION:
An explicitly stated certification.

ACHIEVEMENT:
An explicitly stated award, competition result, ranking,
recognition, or other meaningful achievement.

OPEN_SOURCE:
An explicitly stated open-source contribution.

RESEARCH:
An explicitly stated research activity or research project.

PUBLICATION:
An explicitly stated paper, article, publication, or similar work.

LEADERSHIP:
An explicitly stated leadership responsibility.

EDUCATION:
A meaningful educational claim that may be relevant to the interview.

OTHER:
A meaningful interviewable claim that does not fit the categories above.

==================================================
WHAT MAKES A GOOD CLAIM
==================================================

Prefer meaningful interviewable claims.

Do NOT create trivial claims such as:

- candidate name
- email
- phone number
- location

Do NOT create a separate claim for every sentence.

Group closely related facts into one meaningful claim.

For example:

A project describing Node.js, Express.js, MongoDB and JWT
should normally produce one primary PROJECT claim rather than
four unrelated project claims.

However, explicitly stated skills may also be represented as
SKILL claims when they are independently relevant.

==================================================
SOURCE SECTION
==================================================

For every claim, provide the resume section from which the claim
originated when that information is available.

Examples:

PROJECTS
EXPERIENCE
SKILLS
CERTIFICATIONS
ACHIEVEMENTS
OPEN_SOURCE
RESEARCH
PUBLICATIONS
EDUCATION

Do not invent a source section.

==================================================
DESCRIPTION
==================================================

The description must summarize the factual information supporting
the claim.

Keep it concise.

Only include facts explicitly supported by CandidateAnalysis.

==================================================
RELATED SKILLS
==================================================

relatedSkillNames should contain technologies or skills explicitly
associated with the claim.

Example:

A MYCAKEPAGE project using:

React.js
Node.js
Express.js
MongoDB
Cloudinary

may have:

relatedSkillNames:
[
    "React.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Cloudinary"
]

Do not invent technologies.

==================================================
DATES
==================================================

If explicit date information exists, preserve it.

Do not infer dates.

For example:

"2024 - 2026"

may become:

{
    "start": "2024",
    "end": "2026"
}

If no date information exists, omit dateRange.

==================================================
CLAIM IDS
==================================================

Every claim must have a stable and descriptive ID.

IDs should be:

- deterministic
- concise
- descriptive
- unique within the candidate

Examples:

project_mycakepage
project_chatterbox
skill_node_express
certification_full_stack_web_development
achievement_hackathon_winner

Do not use random IDs.

==================================================
DEDUPLICATION
==================================================

Do not create duplicate claims.

If multiple pieces of CandidateAnalysis describe the same
underlying claim, combine them into one claim.

==================================================
INTERVIEW VALUE
==================================================

Claims should represent things that can reasonably be investigated
during an interview.

Prioritize meaningful evidence over resume coverage.

Do not attempt to create a claim for every trivial resume detail.

==================================================
OUTPUT
==================================================

Return ONLY the structured response defined by the schema.
`;

export const extractResumeClaims = async (
    input: ExtractResumeClaimsInput
): Promise<ExtractResumeClaimsResult> => {

    const userPrompt = `
# Candidate Analysis

${JSON.stringify(input.candidateAnalysis, null, 2)}

Extract the interviewable resume claims from this CandidateAnalysis.
`;

    try {
        const response = await openai.chat.completions.parse({
            model: MODEL_NAME,
            temperature: 0.1,

            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],

            response_format: zodResponseFormat(
                resumeClaimsSchema,
                "resume-claims"
            ),
        });

        const result = response.choices[0]?.message.parsed;

        if (!result) {
            throw new Error(
                "ClaimExtractionAgent: OpenAI failed to return resume claims."
            );
        }

        return result;

    } catch (error) {

    throw formatLLMError(
    "ClaimExtractionAgent",
    error
);
}
};
import {
    GenerateInterviewPlanDto,
} from "./planner.types.js";


export const buildPlannerPrompt = (
    input: GenerateInterviewPlanDto
): string => {

    return `
# Candidate Profile

${JSON.stringify(
    input.candidateProfile,
    null,
    2
)}


# Resume Claims

${JSON.stringify(
    input.resumeClaims,
    null,
    2
)}


# Target Role

${input.targetRole}


# Interview Type

${input.interviewType}


# Interview Duration

${input.durationMinutes} minutes


# Language

${input.language}


==================================================
PLANNER OBJECTIVE
==================================================

Create an evidence-driven investigation strategy for this
specific candidate.

The objective is NOT to cover every resume item.

The objective is to identify the smallest number of high-value
investigation areas that can reveal the candidate's actual
engineering ability within the available interview time.


==================================================
IMPORTANT INPUT DEFINITIONS
==================================================

Candidate Profile:

Describes the candidate's background, education, experience,
skills, projects, achievements, certifications, and other
resume-derived information.

Resume Claims:

These are the factual interviewable claims extracted from the
candidate's resume.

A claim may represent:

- a project
- a skill
- professional experience
- an achievement
- a certification
- another resume-supported fact


==================================================
EVIDENCE-FIRST PLANNING
==================================================

Do NOT create one stage for every claim.

Do NOT create one stage for every technology.

Group claims when they represent the same engineering system,
project, experience, or meaningful investigation area.

For example:

Project:
MYCAKEPAGE

Claims:

- MYCAKEPAGE project
- Node.js
- Express.js
- MongoDB
- JWT authentication

should normally produce ONE coherent project investigation
rather than five separate stages.

The interviewer can investigate those technologies naturally
while understanding the project.


==================================================
CLAIM RELATIONSHIPS
==================================================

You must identify meaningful relationships between claims.

Use:

DEMONSTRATED_THROUGH

when one claim is demonstrated through another claim.

Example:

skill_node_express
    ->
DEMONSTRATED_THROUGH
    ->
project_mycakepage


SUPPORTED_BY

when one claim provides supporting evidence for another claim.


RELATED_TO

when two claims are meaningfully related but neither clearly
demonstrates the other.


DUPLICATES

when two claims substantially represent the same evidence.


EXTENDS

when one claim represents an extension or deeper version of
another claim.


CONTEXT_FOR

when one claim provides useful context for understanding
another claim.


Do NOT create relationships merely because two claims mention
similar words.

Only create relationships that are supported by the supplied
Candidate Profile and Resume Claims.


==================================================
STAGE DESIGN
==================================================

Each stage represents a coherent investigation area.

Each stage must contain:

- primaryClaimType
- investigationMode
- priority
- difficulty
- objectives
- investigationGoal
- investigationDimensions
- claims
- estimatedQuestions
- adaptive


==================================================
PRIMARY CLAIM TYPE
==================================================

primaryClaimType represents the dominant resume claim category
being investigated.

It must correspond to the primary claim in the stage.

For example:

A backend project:

primaryClaimType:
PROJECT


A professional role:

primaryClaimType:
EXPERIENCE


A certification being directly investigated:

primaryClaimType:
CERTIFICATION


Do not use a generic type when a more specific supplied claim
type is appropriate.


==================================================
INVESTIGATION MODE
==================================================

Use:

CLAIM_BASED

for normal investigation of a resume-backed claim.

Use:

FUNDAMENTALS_CHECK

only when foundational technical knowledge must be independently
verified.

Use:

SCENARIO

only when a realistic engineering scenario provides meaningful
additional evidence.

Do NOT use FUNDAMENTALS_CHECK or SCENARIO merely to increase the
number of stages.


==================================================
STAGE CLAIM ROLES
==================================================

Every stage contains claims.

Each claim must have one role:

PRIMARY

The main claim being investigated directly.

SUPPORTING

A claim that helps provide evidence for the primary claim and may
be investigated naturally during the stage.

CONTEXTUAL

A claim that provides useful context but should generally not
become a direct investigation target.


Example:

claims:

[
    {
        "claimId": "project_mycakepage",
        "role": "PRIMARY"
    },
    {
        "claimId": "skill_node_express",
        "role": "SUPPORTING"
    },
    {
        "claimId": "skill_mongodb",
        "role": "SUPPORTING"
    }
]


Do NOT make every claim PRIMARY.

A skill already demonstrated through a meaningful project should
usually be SUPPORTING rather than becoming a separate stage.


==================================================
CLAIM DE-DUPLICATION
==================================================

If a skill is already strongly demonstrated through a project or
professional experience, do not create a separate skill stage
unless there is meaningful additional evidence to obtain.

Bad:

Stage 1:
MYCAKEPAGE Backend

Stage 2:
Node.js

Stage 3:
Express.js

Stage 4:
JWT

Better:

Stage 1:
MYCAKEPAGE Backend Engineering

with the relevant technologies as supporting claims.


==================================================
ROLE RELEVANCE
==================================================

The target role determines which claims deserve interview time.

For example, for a Backend Developer:

high-value areas may include:

- backend architecture
- APIs
- databases
- authentication
- authorization
- error handling
- debugging
- security
- scalability
- deployment
- technical trade-offs

However, these are NOT mandatory topics.

Only investigate areas supported by the candidate's actual
resume evidence.


==================================================
INTERVIEW TIME
==================================================

The requested duration is a hard constraint.

Prefer fewer high-value stages for short interviews.

Use additional stages only when the additional investigation
provides meaningful evidence.

estimatedQuestions is an approximate flexible budget.

It is NOT a fixed number of questions.

The Interview Brain may later:

- ask fewer questions
- ask follow-ups
- probe deeper
- move early
- skip lower-value areas


==================================================
NATURAL INTERVIEW FLOW
==================================================

The resulting plan should feel like a human interviewer reviewed
the resume and selected a few areas worth understanding deeply.

A typical flow may be:

1. Strongest relevant project or experience
2. Deeper implementation investigation
3. Another high-value project or experience
4. Targeted skill verification
5. Optional scenario or fundamentals check

This is only a guideline.

Adapt the plan to the actual candidate.


==================================================
ANTI-REPETITION
==================================================

Avoid multiple stages investigating substantially identical
evidence.

For example:

JWT
Authentication
Token Authentication
JWT Security

should generally be consolidated into one coherent investigation
area when the same evidence is being tested.


==================================================
FACTUALITY
==================================================

Never invent:

- projects
- technologies
- companies
- responsibilities
- achievements
- certifications
- experience
- relationships between claims that are unsupported by the input


==================================================
OUTPUT RULES
==================================================

Return ONLY the structured JSON object matching the supplied
schema.

The output must contain:

stages

claimRelationships

totalQuestions

estimatedDurationMinutes


Every stage MUST contain:

- id
- topic
- primaryClaimType
- investigationMode
- priority
- difficulty
- objectives
- investigationGoal
- investigationDimensions
- claims
- estimatedQuestions
- adaptive


Every stage's claims array MUST contain objects with:

{
    "claimId": "...",
    "role": "PRIMARY | SUPPORTING | CONTEXTUAL"
}


Every claimId MUST come directly from the supplied Resume Claims.

Every relationship must reference supplied Resume Claim IDs.

The sum of all stage estimatedQuestions MUST equal
totalQuestions.

Do not generate interview questions.

Do not evaluate the candidate.

Do not provide explanations outside the structured JSON object.
`;
};
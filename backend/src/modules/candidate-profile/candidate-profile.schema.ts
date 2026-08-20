import { z } from 'zod';

export const ContactChannelSchema = z.object({
  type: z.enum(['EMAIL', 'PHONE', 'LOCATION']),
  value: z.string(),
});

export const OnlinePresenceSchema = z.object({
  platform: z.enum(['LINKEDIN', 'GITHUB', 'PORTFOLIO', 'TWITTER', 'OTHER']),
  url: z.string(),
  username: z.string().nullable(),
});

export const SeniorityLevelEnum = z.enum([
  'ENTRY',
  'MID',
  'SENIOR',
  'LEAD',
  'PRINCIPAL',
  'EXECUTIVE',
]);

export const IdentityProfileSchema = z.object({
  fullName: z
    .string()
    .describe('Candidate full name. Return "Candidate" if not explicitly found.'),
  primaryTitle: z
    .string()
    .nullable()
    .describe('e.g., "Full Stack Developer". Return null if not mentioned.'),
  headline: z.string().nullable(),
  executiveSummary: z
    .string()
    .describe('Synthesized 2-3 sentence summary based ONLY on provided text.'),
  perceivedSeniorityLevel: SeniorityLevelEnum.describe(
    'Inferred seniority level. Defaults to ENTRY if resume is minimal.'
  ),
  estimatedYearsOfExperience: z.number().nullable(),
  contactChannels: z.array(ContactChannelSchema),
  onlinePresences: z.array(OnlinePresenceSchema),
});

export const ProficiencyLevelEnum = z.enum([
  'FOUNDATIONAL',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
]);

export const SkillItemSchema = z.object({
  canonicalName: z.string().describe('Normalized name e.g. "Node.js" or "React"'),
  rawName: z.string().describe('Exact skill text from resume'),
  categories: z.array(z.string()).describe('e.g., ["Backend", "Languages"]'),
  proficiencyLevel: ProficiencyLevelEnum.nullable(),
  yearsOfExperience: z.number().nullable(),
});

export const SkillGroundedPointSchema = z.object({
  description: z.string(),
  associatedSkills: z.array(z.string()).nullable(),
});

export const WorkExperienceSchema = z.object({
  id: z.string().describe('Unique string e.g., "work_1"'),
  companyName: z.string(),
  roleTitle: z.string(),
  startDate: z.string().describe('YYYY or YYYY-MM format'),
  endDate: z.string().nullable().describe('YYYY, YYYY-MM, or null if currently working here'),
  isCurrent: z.boolean(),
  summary: z.string().nullable(),
  keyAchievements: z.array(SkillGroundedPointSchema),
  technologiesUsed: z.array(z.string()),
});

export const EducationLevelEnum = z.enum([
  'SECONDARY',
  'DIPLOMA',
  'UNDERGRADUATE',
  'POSTGRADUATE',
  'DOCTORATE',
  'BOOTCAMP',
  'OTHER',
]);

export const EducationEntrySchema = z.object({
  id: z.string().describe('Unique string e.g., "edu_1"'),
  institution: z.string(),
  educationLevel: EducationLevelEnum,
  degreeOrCertification: z.string(),
  fieldOfStudy: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const ProjectEntrySchema = z.object({
  id: z.string().describe('Unique string e.g., "proj_1"'),
  title: z.string(),
  summary: z.string(),
  url: z.string().nullable(),
  keyContributions: z.array(SkillGroundedPointSchema),
  technologiesUsed: z.array(z.string()),
});

export const CandidateAnalysisSchema = z.object({
  identity: IdentityProfileSchema,
  skills: z.array(SkillItemSchema),
  workExperiences: z.array(WorkExperienceSchema),
  education: z.array(EducationEntrySchema),
  projects: z.array(ProjectEntrySchema),
});

export const GenerateCandidateProfileDTOSchema = z.object({
  resumeId: z
    .string({
      message: "resumeId is required",
    })
    .cuid({ message: "resumeId must be a valid CUID" }),
});

export const GetProfileParamsSchema = z.object({
  resumeId: z
    .string({
      message: "resumeId parameter is required",
    })
    .cuid({ message: "resumeId must be a valid CUID" }),
});
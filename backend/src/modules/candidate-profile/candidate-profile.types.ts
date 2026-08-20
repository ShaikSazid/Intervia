import { z } from 'zod';
import {
  ContactChannelSchema,
  OnlinePresenceSchema,
  IdentityProfileSchema,
  SkillItemSchema,
  SkillGroundedPointSchema,
  WorkExperienceSchema,
  EducationEntrySchema,
  CandidateAnalysisSchema,
  ProjectEntrySchema,
  GenerateCandidateProfileDTOSchema,
} from './candidate-profile.schema.js';

// --- Zod Inferred Types ---
export type ContactChannel = z.infer<typeof ContactChannelSchema>;
export type OnlinePresence = z.infer<typeof OnlinePresenceSchema>;
export type IdentityProfile = z.infer<typeof IdentityProfileSchema>;

export type SkillItem = z.infer<typeof SkillItemSchema>;
export type SkillGroundedPoint = z.infer<typeof SkillGroundedPointSchema>;

export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;

export type CandidateAnalysis = z.infer<typeof CandidateAnalysisSchema>;

// --- HTTP Request DTOs ---
// 1. Incoming payload from req.body
export type GenerateCandidateProfileDto = z.infer<typeof GenerateCandidateProfileDTOSchema>;

// --- Service Layer Interfaces ---
// 2. Internal parameters passed from Controller -> Service
export interface GenerateProfileParams {
  resumeId: string;
  userId: string;
}

export interface GetProfileParams {
  resumeId: string;
  userId: string;
}

// --- API Response DTOs ---
export interface CandidateProfileResponseDTO {
  id: string;
  resumeId: string;
  candidateAnalysis: CandidateAnalysis;
  llmModel: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
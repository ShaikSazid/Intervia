import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { CreateResumeChunkDto, CreateResumeDto } from "./resume.types.js";

export const createResume = async (data: CreateResumeDto) => {
    return prisma.resume.create({ data });
}

export const findUserResumes = async (userId: string) => {
    return prisma.resume.findMany({ where: { userId } });
}

export const findResumeById = async (resumeId: string) => {
    return prisma.resume.findUnique({ where: { id: resumeId } });
}

export const deleteResume = async (resumeId: string) => {
    return prisma.resume.delete({ where: { id: resumeId } });
}
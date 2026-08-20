import { prisma } from "../../lib/prisma.js";
import { CreateSessionDto } from "./session.types.js";

export const createSession = (data: CreateSessionDto) => {
    return prisma.session.create({ data });
}

export const findSessionByRefreshToken = (refreshToken: string) => {
    return prisma.session.findUnique({ where: { refreshToken } });
}

export const deleteSession = (refreshToken: string) => {
    return prisma.session.delete({ where: { refreshToken } });
}
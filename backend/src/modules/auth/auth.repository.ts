import { prisma } from "../../lib/prisma.js";
import { createUserDto } from "./auth.types.js";

export const createUser = async (data: createUserDto) => {
    return await prisma.user.create({ data: {
        email: data.email,
        username: data.username,
        password: data.password
    } });
}

export const findUser = (email: string) => {
    return prisma.user.findUnique({ where: { email }});
}

export const findUserById = (userId: string) => {
    return prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, username: true }});
}
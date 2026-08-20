import { Prisma } from "../../generated/prisma/client.js";

export const toPrismaJson = <T>(value: T): Prisma.InputJsonValue => {
    return value as unknown as Prisma.InputJsonValue;
};

export const fromPrismaJson = <T>(
    value: Prisma.JsonValue
): T => {
    return value as T;
};
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { TokenPayload, VerifiedTokenPayload } from "./jwt.types.js";

export const generateAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "30m" });
}

export const verifyAccessToken = (token: string): VerifiedTokenPayload => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as VerifiedTokenPayload;
}

export const generateRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export const verifyRefreshToken = (token: string): VerifiedTokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as VerifiedTokenPayload;
}
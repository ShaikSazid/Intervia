import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { verifyAccessToken } from "../common/utils/jwt.js";
import * as authRepository from "../modules/auth/auth.repository.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader) throw new UnauthorizedError("Authorization header is missing");
    if(!authHeader.startsWith("Bearer")) throw new UnauthorizedError("Invalid authorization header");
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    const user = await authRepository.findUserById(payload.userId);
    if(!user) throw new UnauthorizedError("User not found");
    req.user = user;
    next();
}
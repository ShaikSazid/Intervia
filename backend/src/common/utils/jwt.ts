import jwt from "jsonwebtoken";

import {
    env,
} from "../../config/env.js";

import {
    UnauthorizedError,
} from "../../errors/UnauthorizedError.js";

import {
    TokenPayload,
    VerifiedTokenPayload,
} from "./jwt.types.js";


export const generateAccessToken = (
    payload: TokenPayload
) => {

    return jwt.sign(
        payload,
        env.JWT_ACCESS_SECRET,
        {
            expiresIn:
                "30m",
        }
    );
};


export const verifyAccessToken = (
    token: string
): VerifiedTokenPayload => {

    if (!token) {

        throw new UnauthorizedError(
            "Access token is missing."
        );
    }


    try {

        return jwt.verify(
            token,
            env.JWT_ACCESS_SECRET
        ) as VerifiedTokenPayload;

    } catch {

        throw new UnauthorizedError(
            "Invalid access token."
        );
    }
};


export const generateRefreshToken = (
    payload: TokenPayload
) => {

    return jwt.sign(
        payload,
        env.JWT_REFRESH_SECRET,
        {
            expiresIn:
                "7d",
        }
    );
};


export const verifyRefreshToken = (
    token: string
): VerifiedTokenPayload => {

    if (!token) {

        throw new UnauthorizedError(
            "Refresh token is missing."
        );
    }


    try {

        return jwt.verify(
            token,
            env.JWT_REFRESH_SECRET
        ) as VerifiedTokenPayload;

    } catch {

        throw new UnauthorizedError(
            "Invalid refresh token."
        );
    }
};
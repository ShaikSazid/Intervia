import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../common/utils/jwt.js";

import {
    comparePassword,
    hashPassword,
} from "../../common/utils/password.js";

import {
    ConflictError,
} from "../../errors/ConflictError.js";

import {
    NotFoundError,
} from "../../errors/NotFoundError.js";

import {
    UnauthorizedError,
} from "../../errors/UnauthorizedError.js";

import {
    createSession,
    findSessionByRefreshToken,
    deleteSession,
} from "../session/session.repository.js";

import * as authRepository
    from "./auth.repository.js";

import {
    loginDto,
    RegisterDto,
} from "./auth.validation.js";


export const signup = async (
    data: RegisterDto
) => {

    const existingUser =
        await authRepository.findUser(
            data.email
        );


    if (existingUser) {

        throw new ConflictError(
            "User already exists"
        );
    }


    const hashedPassword =
        await hashPassword(
            data.password
        );


    const user =
        await authRepository.createUser({

            ...data,

            password:
                hashedPassword,
        });


    return user;
};


export const login = async (
    data: loginDto
) => {

    console.log(
        "Login start"
    );


    const user =
        await authRepository.findUser(
            data.email
        );


    if (!user) {

        throw new NotFoundError(
            "User not found"
        );
    }


    const isMatch =
        await comparePassword(
            data.password,
            user.password
        );


    if (!isMatch) {

        throw new UnauthorizedError(
            "Invalid email or password"
        );
    }


    const accessToken =
        generateAccessToken({

            userId:
                user.id,

            email:
                user.email,
        });


    const refreshToken =
        generateRefreshToken({

            userId:
                user.id,

            email:
                user.email,
        });


    console.log(
        "Generated refresh token"
    );


    console.log(
        "Creating session..."
    );


    await createSession({

        refreshToken,

        expiresAt:
            new Date(
                Date.now() +
                7 *
                24 *
                60 *
                60 *
                1000
            ),

        userId:
            user.id,
    });


    console.log(
        "Session created."
    );


    return {

        accessToken,

        refreshToken,
    };
};


export const logout = async (
    refreshToken?: string
) => {

    if (!refreshToken) {

        return;
    }


    await deleteSession(
        refreshToken
    );
};


export const refresh = async (
    refreshToken: string
) => {

    if (!refreshToken) {

        throw new UnauthorizedError(
            "Refresh token is missing."
        );
    }


    const payload =
        verifyRefreshToken(
            refreshToken
        );


    const session =
        await findSessionByRefreshToken(
            refreshToken
        );


    if (!session) {

        throw new UnauthorizedError(
            "Invalid refresh session."
        );
    }


    /*
     * Optional but important:
     *
     * If you persist expiresAt in the session,
     * reject an expired database session too.
     */

    if (
        session.expiresAt &&
        session.expiresAt.getTime() <
            Date.now()
    ) {

        await deleteSession(
            refreshToken
        );


        throw new UnauthorizedError(
            "Refresh session has expired."
        );
    }


    const accessToken =
        generateAccessToken({

            userId:
                payload.userId,

            email:
                payload.email,
        });


    return accessToken;
};
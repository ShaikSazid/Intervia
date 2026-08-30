import * as authService from "./auth.service.js";

import {
    loginSchema,
    signupSchema,
} from "./auth.validation.js";

import {
    asyncHandler,
} from "../../middleware/asyncHandler.js";

import {
    UnauthorizedError,
} from "../../errors/UnauthorizedError.js";

import { env } from "../../config/env.js";


export const signup =
    asyncHandler(
        async (
            req,
            res
        ) => {

            const data =
                signupSchema.parse(
                    req.body
                );


            const result =
                await authService.signup(
                    data
                );


            res.status(201).json({

                success: true,

                message:
                    `${result.username} signed up successfully`,
            });
        }
    );


export const login =
    asyncHandler(
        async (
            req,
            res
        ) => {

            const data =
                loginSchema.parse(
                    req.body
                );


            const result =
                await authService.login(
                    data
                );

            res.cookie(
                "refreshToken",
                result.refreshToken,
                {
                    httpOnly: true,

                    secure: true,

                    sameSite: "none",

                    path: "/api/auth",

                    maxAge:
                        7 *
                        24 *
                        60 *
                        60 *
                        1000,
                }
            );


            return res.status(200).json({

                success: true,

                accessToken:
                    result.accessToken,
            });
        }
    );


export const me =
    asyncHandler(
        async (
            req,
            res
        ) => {

            res.status(200).json({

                success: true,

                user:
                    req.user,
            });
        }
    );


export const logout =
    asyncHandler(
        async (
            req,
            res
        ) => {

            const refreshToken =
                req.cookies?.refreshToken;


            if (refreshToken) {

                await authService.logout(
                    refreshToken
                );
            }


            res.clearCookie(
                "refreshToken",
                {
                    httpOnly: true,

                    secure: true,

                    sameSite: "none",

                    path: "/api/auth",
                }
            );


            return res.status(200).json({

                success: true,

                message:
                    "Logged out successfully",
            });
        }
    );


export const refresh =
    asyncHandler(
        async (
            req,
            res
        ) => {

            console.log(
                "[Auth Refresh] Cookies:",
                req.cookies
            );

            const refreshToken =
                req.cookies?.refreshToken;

            console.log(
                "[Auth Refresh] Refresh token exists:",
                Boolean(refreshToken)
            );

            if (!refreshToken) {

                throw new UnauthorizedError(
                    "Refresh token is missing."
                );
            }

            const accessToken =
                await authService.refresh(
                    refreshToken
                );

            return res.status(200).json({
                success: true,
                accessToken,
            });
        }
    );
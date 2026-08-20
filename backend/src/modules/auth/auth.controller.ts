import * as authService from "./auth.service.js"
import { loginSchema, signupSchema } from "./auth.validation.js"
import { asyncHandler } from "../../middleware/asyncHandler.js"

export const signup = asyncHandler(async (req, res) => {
    const data = signupSchema.parse(req.body);
    const result = await authService.signup(data);
    res.status(201).json({ success: true, message: `${result.username} signed up successfully`});
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    });
    return res.status(200).json({ success: true, accessToken: result.accessToken });
});

export const me = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

export const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    await authService.logout(refreshToken);
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
});

export const refresh = asyncHandler(async (req, res) => {
    const accessToken = await authService.refresh(req.cookies.refreshToken);
    return res.status(200).json({ accessToken: accessToken });
});
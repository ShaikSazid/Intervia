import api from "@/lib/axios";

import type { LoginDto, RegisterDto, LoginResponseDto, RefreshResponseDto, SignupResponseDto, meResponseDto } from "../types/auth.dto";

const signup = async (data: RegisterDto): Promise<SignupResponseDto> => {
    const response = await api.post<SignupResponseDto>("/auth/signup", data);
    return response.data;
}
const login = async (data: LoginDto): Promise<LoginResponseDto> => {
    const result = await api.post<LoginResponseDto>("/auth/login", data);
    return result.data;
}

const refresh = async (): Promise<RefreshResponseDto> => {
    const result = await api.post<RefreshResponseDto>("/auth/refresh");
    return result.data;
}

const logout = async (): Promise<void> => {
    await api.post("/auth/logout");
}

const getMe = async (): Promise<meResponseDto> => {
    const response = await api.get<meResponseDto>("/auth/me");
    return response.data;
}

export const authApi = { signup, login, logout, refresh, getMe };
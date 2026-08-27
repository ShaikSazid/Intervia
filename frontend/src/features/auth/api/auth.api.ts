import api from "@/lib/axios";

import type {
    LoginDto,
    LoginResponseDto,
    RefreshResponseDto,
    RegisterDto,
    SignupResponseDto,
    meResponseDto,
} from "../types/auth.dto";


export const authApi = {

    async signup(
        data: RegisterDto
    ): Promise<SignupResponseDto> {

        const response =
            await api.post<SignupResponseDto>(
                "/auth/signup",
                data
            );

        return response.data;
    },


    async login(
        data: LoginDto
    ): Promise<LoginResponseDto> {

        const response =
            await api.post<LoginResponseDto>(
                "/auth/login",
                data
            );

        return response.data;
    },


    async refresh(): Promise<RefreshResponseDto> {

        const response =
            await api.post<RefreshResponseDto>(
                "/auth/refresh"
            );

        return response.data;
    },


    async getMe(): Promise<meResponseDto> {

        const response =
            await api.get<meResponseDto>(
                "/auth/me"
            );

        return response.data;
    },


    async logout(): Promise<void> {

        await api.post(
            "/auth/logout"
        );
    },
};
import type { User } from "./auth.types";

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    username?: string;
    password: string;
}

export interface LoginResponseDto {
    success: boolean;
    accessToken: string;
}

export interface RefreshResponseDto {
    accessToken: string;
}

export interface SignupResponseDto {
    success: boolean;
    message: string;   
}

export interface meResponseDto {
    success: boolean;
    user: User;
}
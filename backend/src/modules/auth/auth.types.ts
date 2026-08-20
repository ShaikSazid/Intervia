export interface createUserDto {
    email: string;
    username?: string;
    password: string
}

export interface AuthUser {
    id: string;
    email: string;
    username: string | null;
}
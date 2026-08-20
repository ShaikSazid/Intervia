export interface CreateSessionDto {
    refreshToken: string;
    expiresAt: Date;
    userId: string
}
export interface TokenPayload {
    userId: string;
    email: string;
}

export interface VerifiedTokenPayload extends TokenPayload {
    iat: number;
    exp: number;
}
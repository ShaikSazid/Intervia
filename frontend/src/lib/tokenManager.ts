let accessToken: string | null = null;

export const tokenManager = {
    getToken(): string | null {
        return accessToken;
    },
    setToken(token: string | null): void {
        accessToken = token;
    },
    clearToken(): void {
        accessToken: null;
    }
}
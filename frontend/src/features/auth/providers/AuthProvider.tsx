import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../types/auth.types";
import type { LoginDto } from "../types/auth.dto";
import { authApi } from "../api/auth.api";
import { tokenManager } from "@/lib/tokenManager";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadCurrentUser = async() => {
        console.log("Calling /me")
        const { user } = await authApi.getMe();
        console.log("Response from /me:", user);
        setUser(user);
    }

    const login = async (credentials: LoginDto): Promise<void> => {
        setIsLoading(true);
        try {
            const { accessToken } = await authApi.login(credentials);
            tokenManager.setToken(accessToken);
            await loadCurrentUser();
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async (): Promise<void> => {
        try {
            await authApi.logout();
        } finally {
            tokenManager.clearToken();
            setUser(null);
        }
    }

    const initialize = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const { accessToken } = await authApi.refresh();
            tokenManager.setToken(accessToken);
            await loadCurrentUser();
        } catch {
            tokenManager.clearToken();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        console.log("AuthProvider Initialized");
        void initialize();
    }, []);

    const value = useMemo(() => (
        {user, isAuthenticated: !!user, isLoading, login, logout}
    ), [user, isLoading]);
    console.log("Auth State", {
    user,
    isAuthenticated: !!user,
    isLoading
});

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if(!context) throw new Error("UseAuth must be used within AuthProvider");
    return context;
}
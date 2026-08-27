import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type { User } from "../types/auth.types";
import type { LoginDto } from "../types/auth.dto";

import { authApi } from "../api/auth.api";
import { tokenManager } from "@/lib/tokenManager";


interface AuthContextType {

    user: User | null;

    isAuthenticated: boolean;

    isLoading: boolean;

    login: (
        credentials: LoginDto
    ) => Promise<void>;

    logout: () => Promise<void>;
}


const AuthContext =
    createContext<
        AuthContextType | undefined
    >(undefined);


interface AuthProviderProps {
    children: ReactNode;
}


export function AuthProvider({
    children,
}: AuthProviderProps) {

    const [
        user,
        setUser,
    ] = useState<User | null>(
        null
    );


    const [
        isLoading,
        setIsLoading,
    ] = useState(true);


    /*
     * ------------------------------------------------------------
     * Load current authenticated user
     * ------------------------------------------------------------
     */

    const loadCurrentUser =
        async (): Promise<void> => {

            console.log(
                "[Auth] Calling /me..."
            );


            const {
                user,
            } =
                await authApi.getMe();


            console.log(
                "[Auth] /me response:",
                user
            );


            setUser(
                user
            );
        };


    /*
     * ------------------------------------------------------------
     * Login
     * ------------------------------------------------------------
     */

    const login =
        async (
            credentials: LoginDto
        ): Promise<void> => {

            setIsLoading(
                true
            );


            try {

                console.log(
                    "[Auth] Logging in..."
                );


                const {
                    accessToken,
                } =
                    await authApi.login(
                        credentials
                    );


                console.log(
                    "[Auth] Login succeeded"
                );


                tokenManager.setToken(
                    accessToken
                );


                await loadCurrentUser();


                console.log(
                    "[Auth] User loaded after login"
                );

            } finally {

                setIsLoading(
                    false
                );
            }
        };


    /*
     * ------------------------------------------------------------
     * Logout
     * ------------------------------------------------------------
     */

    const logout =
        async (): Promise<void> => {

            try {

                console.log(
                    "[Auth] Logging out..."
                );


                await authApi.logout();

            } finally {

                tokenManager.clearToken();

                setUser(
                    null
                );


                console.log(
                    "[Auth] Logged out"
                );
            }
        };


    /*
     * ------------------------------------------------------------
     * Restore authentication after page refresh
     * ------------------------------------------------------------
     *
     * The access token is kept only in memory.
     *
     * Therefore, after a browser refresh:
     *
     * access token disappears
     *        ↓
     * refresh endpoint
     *        ↓
     * new access token
     *        ↓
     * /me
     *        ↓
     * restore user
     *
     */

    const initialize = async (): Promise<void> => {
    setIsLoading(true);

    try {
        console.log("[Auth] Restoring session...");

        const { accessToken } =
            await authApi.refresh();

        console.log(
            "[Auth] Refresh response received:",
            Boolean(accessToken)
        );

        tokenManager.setToken(
            accessToken
        );

        await loadCurrentUser();

    } catch (error) {

        console.error(
            "[Auth] Session restoration failed:",
            error
        );

        tokenManager.clearToken();
        setUser(null);

    } finally {
        setIsLoading(false);
    }
};


    /*
     * ------------------------------------------------------------
     * Initialize once
     * ------------------------------------------------------------
     */

    useEffect(() => {

        console.log(
            "[Auth] AuthProvider initialized"
        );


        void initialize();

    }, []);


    /*
     * ------------------------------------------------------------
     * Context value
     * ------------------------------------------------------------
     */

    const value =
        useMemo(
            () => ({

                user,

                isAuthenticated:
                    !!user,

                isLoading,

                login,

                logout,

            }),
            [
                user,
                isLoading,
            ]
        );


    /*
     * ------------------------------------------------------------
     * Debug state
     * ------------------------------------------------------------
     */

    console.log(
        "[Auth] Current state:",
        {
            user,
            isAuthenticated:
                !!user,
            isLoading,
        }
    );


    return (

        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}


/*
|--------------------------------------------------------------------------
| useAuth
|--------------------------------------------------------------------------
*/

export function useAuth():
    AuthContextType {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }


    return context;
}
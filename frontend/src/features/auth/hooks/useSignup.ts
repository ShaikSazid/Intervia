import { useState } from "react";
import axios from "axios";

import { authApi } from "../api/auth.api";
import type { RegisterDto } from "../types/auth.dto";

interface useSignupReturn {
    signup: (data: RegisterDto) => Promise<void>;
    isPending: boolean;
    error: string | null;
}

export function useSignup(): useSignupReturn {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signup = async (data: RegisterDto): Promise<void> => {
        setIsPending(true);
        setError(null);

        try {
            await authApi.signup(data);
        } catch (error) {
            if(axios.isAxiosError(error)) {
                setError(error.response?.data?.message ?? "Unable to create your account");
            } else {
                setError("An unexpected error occured");
            }
        } finally {
            setIsPending(false);
        }
    }
    return { signup, isPending, error };
}
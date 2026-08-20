import axios from "axios";
import { tokenManager } from "./tokenManager";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    timeout: 10_000,
    headers: {
        "Content-Type": "application/json"
    }
});

const refreshAccessToken = async (): Promise<string> => {
    const response = await api.post("/auth/refresh");
    const { accessToken } = response.data;
    tokenManager.setToken(accessToken);
    return accessToken;
}

api.interceptors.request.use((config) => {
    const token = tokenManager.getToken();
    console.log("Request Interceptor");
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use((response) => response, async(error) => {
        const originalRequest = error.config;

        if (originalRequest?.url === "/auth/refresh") {
            return Promise.reject(error);
        }
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }
        if (!originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                refreshPromise = refreshAccessToken().finally(() => {
                    isRefreshing = false;
                    refreshPromise = null;
                });
            }

            await refreshPromise;

            return api(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default api;
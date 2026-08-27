import axios from "axios";
import { tokenManager } from "./tokenManager";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    timeout: 10_000,
});


const refreshAccessToken = async (): Promise<string> => {

    const response =
        await api.post(
            "/auth/refresh"
        );


    const {
        accessToken,
    } = response.data;


    tokenManager.setToken(
        accessToken
    );


    return accessToken;
};


api.interceptors.request.use(
    (config) => {

        const token =
            tokenManager.getToken();


        console.log(
            "Request Interceptor"
        );


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }


        return config;
    }
);


let isRefreshing = false;

let refreshPromise:
    Promise<string> | null = null;


api.interceptors.response.use(

    (response) =>
        response,

    async (error) => {

        const originalRequest =
            error.config;


        /*
         * Never retry the refresh request itself.
         */

        if (
            originalRequest?.url ===
            "/auth/refresh"
        ) {

            return Promise.reject(
                error
            );
        }


        /*
         * Only handle 401 responses.
         */

        if (
            error.response?.status !==
            401
        ) {

            return Promise.reject(
                error
            );
        }


        /*
         * Prevent infinite retry loops.
         */

        if (
            originalRequest?._retry
        ) {

            return Promise.reject(
                error
            );
        }


        originalRequest._retry =
            true;


        /*
         * If another request is already
         * refreshing the token, wait for it.
         */

        if (!isRefreshing) {

            isRefreshing =
                true;


            refreshPromise =
                refreshAccessToken()
                    .finally(() => {

                        isRefreshing =
                            false;

                        refreshPromise =
                            null;
                    });
        }


        try {

            await refreshPromise;

            return api(
                originalRequest
            );

        } catch (
            refreshError
        ) {

            tokenManager.clearToken();

            return Promise.reject(
                refreshError
            );
        }
    }
);


export default api;
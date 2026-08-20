import axios from "axios";

declare module "axios" {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}
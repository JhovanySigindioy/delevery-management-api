import axios from "axios";
import { env } from "../config";
import { AuthSuccessResponse } from "../interfaces/authResponse";
import { ApiResponse } from "../interfaces";

interface LoginCredentials {
    idusers: string;
    password: string;
}

export async function loginService(credentials: LoginCredentials): Promise<ApiResponse<AuthSuccessResponse>> {
    try {
        const response = await axios.post<AuthSuccessResponse>(
            `${env.authApi.url}`,
            credentials,
            { headers: { "Content-Type": "application/json" } }
        );

        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error: any) {
        const msg = error.response?.data?.message || "Error inesperado al autenticar.";
        return {
            success: false,
            data: null,
            error: msg
        };
    }
}

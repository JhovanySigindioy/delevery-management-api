import { loginService } from "../api/auth";


export async function authenticateService(idusers: string, password: string) {
    return await loginService({ idusers, password });
}

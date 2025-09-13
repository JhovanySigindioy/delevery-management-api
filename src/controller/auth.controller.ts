import { Request, Response } from "express";
import { logger } from "../utils";
import { authenticateService } from "../services/auth.service";
import { ApiResponse } from "../interfaces";
import { AuthSuccessResponse } from "../interfaces/authResponse";

export const loginController = async (req: Request, res: Response) => {
    try {
        const { idUsers, password } = req.body;

        const result: ApiResponse<AuthSuccessResponse> = await authenticateService(idUsers, password);

        return res.status(result.success ? 200 : 401).json(result);

    } catch (error: unknown) {
        logger.error("❌ Error en loginController:", error);

        const response: ApiResponse = {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : "Error interno al procesar la petición.",
        };
        return res.status(500).json(response);
    }
};

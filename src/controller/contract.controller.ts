// src/controllers/contractData.controller.ts
import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { getContractDataService } from "../services/contractData.service";

export async function getContractDataController(req: Request, res: Response) {
    try {
        const { nit, userId } = req.query;

        const result = await getContractDataService(nit as string, userId as string);

        if (result.error) {
            logger.warn(` Consulta sin resultados: NIT=${nit}, idUsuario=${userId}`);
            return res.status(404).json({
                success: false,
                data: null,
                error: result.error,
            });
        }


        logger.info(` Consulta exitosa: NIT=${nit}, idUsuario=${userId}`);
        return res.status(200).json({
            success: true,
            data: {
                contract: result.contract,
                pharmacy: result.pharmacy,
            },
            error: null,
        });

    } catch (error) {
        logger.error(" Error en getContractDataController:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Error interno del servidor",
        });
    }
}

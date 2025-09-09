// src/controllers/contractData.controller.ts
import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { getFormulaDataService } from "../services/formulaData.service";
import { IUnifiedResponse } from "../services/formulaData.service";

export async function getFormulaDataController(req: Request, res: Response): Promise<Response> {
    try {
        const { registeredTypeNumber, dispensaryCode } = req.query;

        // El servicio ahora devuelve un objeto con un formato unificado
        const result: IUnifiedResponse = await getFormulaDataService(registeredTypeNumber as string, dispensaryCode as string);

        if (result.error) {
            logger.warn(`Consulta sin resultados: radicado/tiponumero=${registeredTypeNumber}, dispensaryCode=${dispensaryCode}. Error: ${result.error}`);
            return res.status(404).json({
                success: false,
                data: null,
                error: result.error,
            });
        }

        // Respuesta exitosa
        logger.info(`Consulta exitosa: radicado/tiponumero=${registeredTypeNumber}, dispensaryCode=${dispensaryCode}`);
        return res.status(200).json({
            success: true,
            data: {
                registeredTypeNumber: registeredTypeNumber,
                identification: result.identificacion,
                name: result.nombre,
                phones: result.telefonos,
                email: result.correo,
                address: result.direccion,
                numberFormula: result.numeroFormula
            },
            error: null,
        });

    } catch (error) {
        logger.error("Error en getFormulaDataController:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Error interno del servidor",
        });
    }
}
// src/controllers/entregas.controller.ts
import { Request, Response } from "express";
import { processDeliveriesService } from "../services/processDeliveries.service";
import { getLastManagementsEntregaService, saveManagementEntregaService } from "../services/entregas.service";
import { ApiResponse } from "../interfaces/apiResponse";
import { DatabaseError, logger } from "../utils";
import { AuthenticatedRequest } from "../middleware";

//Guardamos el reporte de la gestion de una entrega
export async function createEntregaController(req: AuthenticatedRequest, res: Response) {
    try {
        const payload = req.jwtPayload as { id: string };
        const pharmacistId = payload?.id;

        const { entrega } = req.body;

        if (!entrega || !entrega.registeredTypeNumber || !entrega.patientName) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "El cuerpo de la petición debe contener una entrega válida con 'registeredTypeNumber' y 'patientName'.",
            });
        }
  
        const shouldSendToDomicile = entrega.callResult === "confirmado";

        if (shouldSendToDomicile) {
            try {
                const ggoResponse = await processDeliveriesService(entrega);

                const saved = await saveManagementEntregaService({
                    ...entrega,
                    sentToHome: true,
                }, pharmacistId);

                if (!saved) {
                    throw new Error("No se pudo guardar la entrega confirmada después de enviarla.");
                }

                const response: ApiResponse = {
                    success: true,
                    data: { ...saved, ggoResponse },
                    error: null,
                };
                return res.status(200).json(response);
            } catch (err: any) {
                logger.error("❌ Error enviando a empresa de domicilio:", err);
                return res.status(502).json({
                    success: false,
                    data: null,
                    error: "No se pudo enviar la entrega al servicio de domicilio. Intente nuevamente.",
                });
            }
        }

        const saved = await saveManagementEntregaService({
            ...entrega,
            sentToHome: false,
        }, pharmacistId);

        if (!saved) {
            throw new Error("No se pudo guardar la gestión en la base de datos.");
        }

        const response: ApiResponse = {
            success: true,
            data: saved,
            error: null,
        };

        return res.status(200).json(response);
    } catch (error: any) {
        logger.error("❌ Error en createEntregaController:", error);

        return res.status(500).json({
            success: false,
            data: null,
            error: error.message || "Error interno al procesar la entrega.",
        });
    }
}


export const getLastManagementsEntregaController = async (req: AuthenticatedRequest, res: Response) => {
    try {

        const payload = req.jwtPayload as { id: string };
        const pharmacistId = payload?.id;

        if (!pharmacistId) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "No se pudo obtener el regente desde el token",
            });
        }

        const entregas = await getLastManagementsEntregaService(pharmacistId);

        const response: ApiResponse = {
            success: true,
            data: entregas,
            error: null,
        };

        return res.status(200).json(response);
    } catch (error) {
        logger.error("❌ Error en getLastManagementsEntregaController:", error);

        const response: ApiResponse = {
            success: false,
            data: null,
            error: error instanceof DatabaseError
                ? error.message
                : "Error interno del servidor al obtener entregas.",
        };

        return res.status(500).json(response);
    }
};

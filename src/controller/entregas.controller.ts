// src/controllers/entregas.controller.ts
import { Request, Response } from "express";
import { processDeliveriesService } from "../services/processDeliveries.service";
import { saveManagementEntregaService } from "../services/managementEntrega.service";
import { ApiResponse } from "../interfaces/apiResponse";

export async function createEntregaController(req: Request, res: Response) {
    try {
        const { entrega } = req.body;

        // Validación mínima
        if (!entrega || !entrega.registeredTypeNumber || !entrega.patientName) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "El cuerpo de la petición debe ser un objeto válido de entrega.",
            });
        }

        //  Caso 1: Confirmado → enviamos primero a la empresa de domicilios
        if (entrega.callResult === "confirmado") {
            try {
                const ggoResponse = await processDeliveriesService(entrega);

                const saved = await saveManagementEntregaService({
                    ...entrega,
                    sentToHome: true,
                });

                if (!saved) {
                    return res.status(500).json({
                        success: false,
                        data: null,
                        error:
                            "Error al guardar la entrega confirmada en la base de datos después de enviarla.",
                    });
                }

                const response: ApiResponse = {
                    success: true,
                    data: { ...saved, ggoResponse },
                    error: null,
                };

                return res.status(200).json(response);
            } catch (err: any) {
                return res.status(502).json({
                    success: false,
                    data: null,
                    error:
                        "No se pudo enviar la entrega al servicio de domicilio. Intente nuevamente.",
                });
            }
        }

        //  Caso 2: No confirmado → solo guardamos en BD (sin enviar a domicilios)
        const saved = await saveManagementEntregaService({
            ...entrega,
            sentToHome: false,
        });

        if (!saved) {
            return res.status(500).json({
                success: false,
                data: null,
                error: "Error al guardar la gestión en la base de datos. porfvaor intente nuevamente.",
            });
        }

        return res.status(200).json({
            success: true,
            data: saved,
            error: null,
        });
    } catch (error: any) {
        console.error(" Error en createEntregaController:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: error.message || "Error interno al procesar la entrega",
        });
    }
}

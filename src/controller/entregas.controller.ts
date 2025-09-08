// src/controllers/entregas.controller.ts
import { Request, Response } from "express";
import { processDeliveriesService } from "../services/processDeliveries.service";
import { saveManagementEntregaService } from "../services/managementEntrega.service";
import { ManagementEntrega } from "../interfaces/managementEntrega";
import { ApiResponse } from "../interfaces/apiResponse";

export async function createEntregaController(req: Request, res: Response) {
    try {
        const { entrega } = req.body;
        console.log("data de entrada :::::", JSON.stringify(entrega, null, 2));

        // Validación mínima
        if (!entrega || !entrega.radicadoTipoNumero || !entrega.nombrePaciente) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "El cuerpo de la petición debe ser un objeto válido de entrega."
            });
        }

        if (entrega.resultadoLlamada === "confirmado") {
            try {
                const ggoResponse = await processDeliveriesService(entrega);

                const saved = await saveManagementEntregaService({
                    ...entrega,
                    enviado_a_domicilio: true,
                });

                if (!saved) {
                    return res.status(500).json({
                        success: false,
                        data: null,
                        error: "Error al guardar la entrega confirmada en la base de datos."
                    });
                }

                const response: ApiResponse = {
                    success: true,
                    data: {
                        // ggoResponse,       // respuesta del servicio externo
                        ...saved // objeto enriquecido con gestion_id
                    },
                    error: null
                };
                return res.status(200).json(response);

            } catch (err: any) {
                return res.status(502).json({
                    success: false,
                    data: null,
                    error: "No se pudo enviar la entrega al servicio de domicilio."
                });
            }
        }

        // 🟡 Caso no confirmado → guardo con enviado_a_domicilio = false
        const saved = await saveManagementEntregaService({
            ...entrega,
            enviado_a_domicilio: false,
        });

        if (!saved) {
            return res.status(500).json({
                success: false,
                data: null,
                error: "Error al guardar la gestión en la base de datos."
            });
        }

        return res.status(200).json({
            success: true,
            data: saved, // objeto enriquecido con gestion_id
            error: null
        });

    } catch (error: any) {
        console.error("❌ Error en createEntregaController:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: error.message || "Error interno al procesar la entrega"
        });
    }
}

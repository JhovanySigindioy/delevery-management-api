// src/api/apiPonalV1.ts
import axios from "axios";
import { env } from "../config";
import { logger } from "../utils/logger";
import { ServiceV1PonalRequest, FormulaData } from "../interfaces/serviceV1Ponal";
import { ApiResponse } from "../interfaces/apiResponse";
import { parserToJson } from "../utils/parserToJson";

export async function getDataRegistered(resgistered: string, dispensaryCode: string): Promise<ApiResponse<FormulaData[]>> {
    try {
        const payload: ServiceV1PonalRequest = {
            Datos: {
                numRadicado: resgistered,
                dispensario: dispensaryCode,
            },
            Servicio: env.apiPonal.servicio,
        };

        const { data } = await axios.post(`${env.apiPonal.url}`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        const parsedResponse = parserToJson<FormulaData[]>(data);

        if (!parsedResponse || !parsedResponse.success) {
            return parsedResponse || { success: false, data: null, error: "Error desconocido al procesar respuesta" };
        }

        return parsedResponse;

    } catch (error: any) {
        logger.error("Error en getDataResgistered:", error);

        return {
            success: false,
            data: null,
            error: error.message || "Error desconocido en getDataRadicado",
        };
    }
}
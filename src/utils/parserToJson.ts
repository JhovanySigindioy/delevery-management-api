// src/utils/parserToJson.ts
import { ApiResponse } from "../interfaces/apiResponse";
import { logger } from "./logger";


export function parserToJson<T>(response: any): ApiResponse<T> | null {
    // Si la respuesta es nula o no es un objeto, devolvemos un error
    if (typeof response !== 'object' || response === null) {
        return { success: false, data: null, error: "Formato de respuesta de API no esperado." };
    }

    // Si el campo 'data' es una cadena, intentamos parsearla
    if (typeof response.data === 'string') {
        try {
            response.data = JSON.parse(response.data);
        } catch (e) {
            logger.error("Error al parsear la cadena de datos:", e);
            return {
                success: false,
                data: null,
                error: "Error al procesar el formato de datos de la API externa."
            };
        }
    }
    
    // Devolvemos la respuesta procesada
    return response as ApiResponse<T>;
}
// src/services/contractData.service.ts
import { connectToDatabase } from "../config";
import { logger } from "../utils/logger";

export interface IPharmacyResponse {
    name: string | null;
    city: string | null;
    pharmacyCode: string | null;
}

export interface IContractResponse {
    contract: string | null;
    pharmacy: IPharmacyResponse | null;
    error: string | null;
}

export async function getContractDataService(nit: string, userId: string): Promise<IContractResponse> {
    let pool;
    try {
        pool = await connectToDatabase();

        // Buscar contrato (cliente) en InfoClientes con el NIT
        const contractResult = await pool.request()
            .input("nit", nit)
            .query<{ Nombre: string }>(`
            SELECT Nombre 
            FROM InfoClientes 
            WHERE IdClientes = @nit
        `);

        const contract = contractResult.recordset[0]?.Nombre || null;
        if (!contract) {
            return { contract: null, pharmacy: null, error: "No se encontró contrato con ese NIT" };
        }

        //  Obtener información de la farmacia según el idUsuario
        const pharmacyResult = await pool.request()
            .input("userId", userId)
            .query<{ pos: string; punto_venta_outlook: string; ciudad: string }>(`
            SELECT f.pos, f.punto_venta_outlook, f.ciudad
            FROM UsuariosPermisos u
            INNER JOIN dw__dim_pos f ON f.pos = u.Menu
            WHERE IdUsuario = @userId
                AND programa = 4548
        `);

        const pharmacy = pharmacyResult.recordset[0]
            ? {
                name: pharmacyResult.recordset[0].punto_venta_outlook,
                city: pharmacyResult.recordset[0].ciudad,
                pharmacyCode: pharmacyResult.recordset[0].pos
            }
            : null;

        return {
            contract,
            pharmacy,
            error: pharmacy ? null : "No se encontraron datos de farmacia para ese usuario"
        };

    } catch (error) {
        logger.error("Error en getContractDataService:", error);
        return {
            contract: null,
            pharmacy: null,
            error: `Error al procesar la solicitud: ${error instanceof Error ? error.message : "Error desconocido"}`
        };
    } finally {
        if (pool) {
            try { pool.close(); } catch (closeError) {
                logger.error("Error cerrando la conexión a la base de datos:", closeError);
            }
        }
    }
}

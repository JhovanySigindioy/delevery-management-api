// // src/services/exportEntregasService.ts
// import sql from "mssql";
// import { ManagementEntregaResponse } from "../interfaces";
// import { DatabaseError, logger } from "../utils";
// import { runTransaction } from "./_baseService";

// export async function getEntregasByDateService(pharmacistId: string, fecha: string) {
//     return runTransaction(async (tx) => {
//         try {
//             const query = `
//         SELECT 
//             gestion_id           AS managementId,
//             paciente_id          AS patientName,      
//             radicado_tipo_numero AS identification,
//             fecha_gestion        AS managementDate,
//             hora_gestion         AS managementTime,
//             fecha_domicilio      AS deliveryDate,
//             hora_domicilio       AS deliveryTime,
//             tipo_empaque         AS packageType,
//             resultado_llamada    AS callResult,
//             observaciones        AS notes,
//             es_urgente           AS isUrgent,
//             enviado_a_domicilio  AS sentToHome,
//             dispensario_id       AS pharmacyCode,
//             regente_id           AS pharmacistId
//         FROM GestionesEntregasPendientes
//             WHERE fecha_domicilio = '2025-09-12'
//             ORDER BY fecha_gestion DESC;
//       `;

//             const result = await new sql.Request(tx).query(query);

//             return result.recordset as ManagementEntregaResponse[];

//         } catch (error) {
//             logger.error("❌ Error obteniendo entregas por fecha:", error);
//             throw new DatabaseError("Error al obtener las entregas del día.");
//         }
//     });
// }

// src/services/exportEntregasService.ts
import sql from "mssql";
import { ManagementEntregaResponse } from "../interfaces";
import { DatabaseError, logger } from "../utils";
import { runTransaction } from "./_base.service";

export async function getEntregasByDateService(pharmacistId: string, fecha: string) {
    return runTransaction(async (tx) => {
        try {
            const query = `
        SELECT 
            gestion_id           AS managementId,
            paciente_id          AS patientName,      
            radicado_tipo_numero AS identification,
            fecha_gestion        AS managementDate,
            CONVERT(varchar(8), hora_gestion, 108)   AS managementTime,  -- HH:mm:ss
            fecha_domicilio      AS deliveryDate,
            CONVERT(varchar(8), hora_domicilio, 108) AS deliveryTime,    -- HH:mm:ss
            tipo_empaque         AS packageType,
            resultado_llamada    AS callResult,
            observaciones        AS notes,
            es_urgente           AS isUrgent,
            enviado_a_domicilio  AS sentToHome,
            dispensario_id       AS pharmacyCode,
            regente_id           AS pharmacistId,
            ''                   AS primaryPhone,
            ''                   AS secondaryPhone,
            ''                   AS email,
            ''                   AS address
        FROM GestionesEntregasPendientes
        WHERE regente_id = @pharmacistId
        AND CAST(fecha_domicilio AS DATE) = @fecha
        ORDER BY fecha_gestion DESC;

      `;

            const result = await new sql.Request(tx)
                .input("pharmacistId", sql.VarChar(20), pharmacistId)
                .input("fecha", sql.Date, fecha)
                .query(query);

            return result.recordset as ManagementEntregaResponse[];
        } catch (error) {
            logger.error("❌ Error obteniendo entregas por fecha:", error);
            throw new DatabaseError("Error al obtener las entregas del día.");
        }
    });
}

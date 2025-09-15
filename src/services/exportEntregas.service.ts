// src/services/exportEntregasService.ts
import sql from "mssql";
import { ManagementEntregaResponse } from "../interfaces";
import { DatabaseError, logger } from "../utils";
import { runTransaction } from "./_base.service";

export async function getEntregasByDateService(
  pharmacistId: string,
  fecha: string
) {
  return runTransaction(async (tx) => {
    try {
      // 1. Obtener farmacia activa del regente logueado
      const pharmacyQuery = `
        SELECT 
          f.pos AS pharmacyCode
        FROM UsuariosPermisos u
        INNER JOIN dw__dim_pos f ON f.pos = u.Menu
        INNER JOIN Clientes cli ON cli.IdClientes = f.pos
        INNER JOIN Ciudad c ON c.IdCiudad = cli.IdCiudad
        WHERE u.IdUsuario = @pharmacistId 
          AND u.programa = 4548;
      `;

      const pharmacyResult = await new sql.Request(tx)
        .input("pharmacistId", sql.VarChar(20), pharmacistId)
        .query(pharmacyQuery);

      const pharmacyRow = pharmacyResult.recordset[0];
      if (!pharmacyRow) {
        throw new DatabaseError("No se encontró farmacia activa para este usuario");
      }

      const pharmacyCode = pharmacyRow.pharmacyCode;

      // 2. Obtener entregas SOLO de esa farmacia
      const query = `
        SELECT 
            g.gestion_id           AS managementId,
            p.nombre_paciente      AS patientName,      
            g.radicado_tipo_numero AS identification,
            g.fecha_gestion        AS managementDate,
            CONVERT(varchar(8), g.hora_gestion, 108)   AS managementTime,  
            g.fecha_domicilio      AS deliveryDate,
            CONVERT(varchar(8), g.hora_domicilio, 108) AS deliveryTime,    
            g.tipo_empaque         AS packageType,
            g.resultado_llamada    AS callResult,
            g.observaciones        AS notes,
            g.es_urgente           AS isUrgent,
            g.enviado_a_domicilio  AS sentToHome,
            g.dispensario_id       AS pharmacyCode,
            g.regente_id           AS pharmacistId,
            p.contacto1            AS primaryPhone,
            p.contacto2            AS secondaryPhone,
            p.correo               AS email,
            p.direccion            AS address,
            c.Descripcion          AS municipalityName,
            d.Descripcion          AS departmentName
        FROM GestionesEntregasPendientes g
        INNER JOIN DatosPacientesDomicilios p 
            ON g.paciente_id = p.paciente_id
        INNER JOIN Clientes cli
            ON cli.IdClientes = g.dispensario_id
        INNER JOIN Ciudad c
            ON c.IdCiudad = cli.IdCiudad
        INNER JOIN Departamentos d
            ON d.IdDepartamento = c.IdDepartamento
        WHERE g.regente_id = @pharmacistId
          AND g.dispensario_id = @pharmacyCode   -- 🟢 farmacia activa de la sesión
          AND CAST(g.fecha_domicilio AS DATE) = @fecha
          AND g.resultado_llamada = 'confirmado'
        ORDER BY g.fecha_gestion DESC;
      `;

      const result = await new sql.Request(tx)
        .input("pharmacistId", sql.VarChar(20), pharmacistId)
        .input("pharmacyCode", sql.VarChar(20), pharmacyCode)
        .input("fecha", sql.Date, fecha)
        .query(query);

      return result.recordset as ManagementEntregaResponse[];
    } catch (error) {
      logger.error("❌ Error obteniendo entregas por fecha:", error);
      throw new DatabaseError("Error al obtener las entregas del día.");
    }
  });
}

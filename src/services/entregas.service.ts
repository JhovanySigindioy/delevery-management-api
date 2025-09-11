import sql from "mssql";
import { runTransaction } from "./_baseService";
import { DatabaseError, logger } from "../utils";
import { ManagementEntregaRequest, ManagementEntregaResponse } from "../interfaces";

export async function saveManagementEntregaService(entrega: ManagementEntregaRequest, pharmacistId: string) {
  return runTransaction(async (tx) => {
    try {
      // 1. Insertar paciente si no existe
      await new sql.Request(tx)
        .input("identificacion", sql.VarChar(20), entrega.identification)
        .input("nombrePaciente", sql.VarChar(100), entrega.patientName)
        .input("contacto1", sql.VarChar(20), entrega.primaryPhone || null)
        .input("contacto2", sql.VarChar(20), entrega.secondaryPhone || null)
        .input("direccion", sql.VarChar(255), entrega.address)
        .input("correo", sql.VarChar(100), entrega.email || null)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM DatosPacientesDomicilios WHERE identificacion = @identificacion)
          BEGIN
            INSERT INTO DatosPacientesDomicilios 
              (nombre_paciente, identificacion, contacto1, contacto2, direccion, correo)
            VALUES 
              (@nombrePaciente, @identificacion, @contacto1, @contacto2, @direccion, @correo)
          END
        `);

      // 2. Insertar gestión y devolver el gestion_id
      const result = await new sql.Request(tx)
        .input("radicado", sql.VarChar(50), entrega.registeredTypeNumber)
        .input("identificacion", sql.VarChar(20), entrega.identification)
        .input("fecha_gestion", sql.Date, entrega.managementDate)              // "2025-09-10"
        .input("hora_gestion", sql.VarChar(8), entrega.managementTime)         // "16:00:00"
        .input("fecha_domicilio", sql.Date, entrega.deliveryDate || null)      // "2025-09-12" o null
        .input("hora_domicilio", sql.VarChar(8), entrega.deliveryTime || null) // "15:00:00" o null
        .input("resultado_llamada", sql.VarChar(50), entrega.callResult)
        .input("tipo_empaque", sql.VarChar(50), entrega.packageType)
        .input("observaciones", sql.VarChar(255), entrega.notes || null)
        .input("regente_id", sql.VarChar(50), pharmacistId)
        .input("es_urgente", sql.Bit, entrega.isUrgent ? 1 : 0)
        .input("enviado_a_domicilio", sql.Bit, entrega.sentToHome ? 1 : 0)
        .input("dispensario_id", sql.VarChar(20), entrega.pharmacyCode)
        .query(`
          INSERT INTO GestionesEntregasPendientes
            (radicado_tipo_numero, paciente_id, fecha_gestion, hora_gestion, fecha_domicilio, hora_domicilio,
             resultado_llamada, tipo_empaque, observaciones, regente_id, es_urgente, enviado_a_domicilio, dispensario_id)
          OUTPUT INSERTED.gestion_id
          VALUES
            (@radicado, (SELECT TOP 1 paciente_id FROM DatosPacientesDomicilios WHERE identificacion = @identificacion),
             @fecha_gestion, @hora_gestion, @fecha_domicilio, @hora_domicilio,
             @resultado_llamada, @tipo_empaque, @observaciones, @regente_id, @es_urgente, @enviado_a_domicilio, @dispensario_id)
        `);

      return {
        ...entrega,
        pharmacistId: pharmacistId,
        managementId: result.recordset[0].gestion_id,
      } as ManagementEntregaResponse;

    } catch (error) {
      logger.error("❌ Error guardando gestión de entrega:", error);
      throw new DatabaseError("Error al guardar la entrega en la base de datos.");
    }
  });
}


export async function getLastManagementsEntregaService(pharmacistId: string) {
  return runTransaction(async (tx) => {
    try {
      const result = await new sql.Request(tx)
        .input("pharmacistId", sql.VarChar(20), pharmacistId)
        .execute("sp_UltimasEntregasPaciente");

      return result.recordset as ManagementEntregaResponse[];
    } catch (error) {
      logger.error("❌ Error obteniendo entregas:", error);

      throw new DatabaseError("Error al obtener las últimas entregas del paciente.");
    }
  });
}

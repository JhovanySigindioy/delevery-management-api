import sql from "mssql";
import { runTransaction } from "./_baseService";
import { ManagementEntrega } from "../interfaces/managementEntrega";
import { parseToTime } from "../utils/parseToTime";

export async function saveManagementEntregaService(entrega: ManagementEntrega) {
  return runTransaction(async (tx) => {
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
      .input("fecha_gestion", sql.Date, new Date(entrega.managementDate))
      .input("hora_gestion", sql.Time, parseToTime(entrega.managementTime))
      .input("fecha_domicilio", sql.Date, entrega.deliveryDate ? new Date(entrega.deliveryDate) : null)
      .input("hora_domicilio", sql.Time, entrega.deliveryTime ? parseToTime(entrega.deliveryTime) : null)
      .input("resultado_llamada", sql.VarChar(50), entrega.callResult)
      .input("observaciones", sql.VarChar(255), entrega.notes || null)
      .input("regente_id", sql.VarChar(50), entrega.pharmacistId)
      .input("es_urgente", sql.Bit, entrega.isUrgent ? 1 : 0)
      .input("enviado_a_domicilio", sql.Bit, entrega.sentToHome ? 1 : 0)
      .query(`
        INSERT INTO GestionesEntregasPendientes
          (radicado_tipo_numero, paciente_id, fecha_gestion, hora_gestion, fecha_domicilio, hora_domicilio,
           resultado_llamada, observaciones, regente_id, es_urgente, enviado_a_domicilio)
        OUTPUT INSERTED.gestion_id
        VALUES
          (@radicado, (SELECT TOP 1 paciente_id FROM DatosPacientesDomicilios WHERE identificacion = @identificacion),
           @fecha_gestion, @hora_gestion, @fecha_domicilio, @hora_domicilio,
           @resultado_llamada, @observaciones, @regente_id, @es_urgente, @enviado_a_domicilio)
      `);

    return {
      ...entrega,
      managementId: result.recordset[0].gestion_id,
    };
  });
}

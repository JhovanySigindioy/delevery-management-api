// src/services/managementEntrega.service.ts
import sql from "mssql";
import { connectToDatabase } from "../config";
import { ManagementEntrega } from "../interfaces/managementEntrega";
import { parseToTime } from "../utils/parseToTime";

export async function saveManagementEntregaService(entrega: ManagementEntrega) {
    let pool: sql.ConnectionPool | null = null;
    let transaction: sql.Transaction | null = null;

    try {
        pool = await connectToDatabase();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 1. Insertar paciente si no existe
        const requestPaciente = new sql.Request(transaction);
        await requestPaciente
            .input("identificacion", sql.VarChar(20), entrega.identificacion)
            .input("nombrePaciente", sql.VarChar(100), entrega.nombrePaciente)
            .input("contacto1", sql.VarChar(20), entrega.contacto1 || null)
            .input("contacto2", sql.VarChar(20), entrega.contacto2 || null)
            .input("direccion", sql.VarChar(255), entrega.direccion)
            .input("correo", sql.VarChar(100), entrega.correo || null)
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
        const requestGestion = new sql.Request(transaction);
        const result = await requestGestion
            .input("radicado", sql.VarChar(50), entrega.radicadoTipoNumero)
            .input("identificacion", sql.VarChar(20), entrega.identificacion)
            .input("fecha_gestion", sql.Date, new Date(entrega.fechaGestion))
            .input("hora_gestion", sql.Time, parseToTime(entrega.horaGestion))
            .input("fecha_domicilio", sql.Date, entrega.fechaDomicilio ? new Date(entrega.fechaDomicilio) : null)
            .input("hora_domicilio", sql.Time, entrega.horaDomicilio ? parseToTime(entrega.horaDomicilio) : null)
            .input("resultado_llamada", sql.VarChar(50), entrega.resultadoLlamada)
            .input("observaciones", sql.VarChar(255), entrega.observaciones || null)
            .input("regente_id", sql.VarChar(50), entrega.regenteId)
            .input("es_urgente", sql.Bit, entrega.esUrgente ? 1 : 0)
            .input("enviado_a_domicilio", sql.Bit, entrega.enviado_a_domicilio ? 1 : 0)
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

        await transaction.commit();

        return {
            ...entrega,
            gestion_id: result.recordset[0].gestion_id,
        };
    } catch (error) {
        console.error("❌ Error en saveManagementEntregaService:", error);
        if (transaction) {
            try { await transaction.rollback(); } catch (rollbackError) {
                console.error("Error en rollback:", rollbackError);
            }
        }
        return null;
    }
}

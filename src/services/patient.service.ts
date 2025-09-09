import sql from "mssql";
import { runTransaction } from "./_baseService";
import { PatientDeliveryInfo } from "../interfaces/patient";
import { DatabaseError, logger } from "../utils";

export async function updatePatientDeliveryInfoService(patient: PatientDeliveryInfo) {
    return runTransaction(async (tx) => {
        try {
            await new sql.Request(tx)
                .input("identificacion", sql.VarChar(20), patient.identification)
                .input("nombrePaciente", sql.VarChar(100), patient.namePatient)
                .input("contacto1", sql.VarChar(100), patient.primaryPhone)
                .input("contacto2", sql.VarChar(100), patient.secondaryPhone || null)
                .input("correo", sql.VarChar(100), patient.email || null)
                .input("direccion", sql.VarChar(255), patient.address)
                .execute("sp_ActualizarDatosPacienteDomicilios");

            return true;
        } catch (error) {
            logger.error("❌ Error actualizando paciente:", error);
            throw new DatabaseError("Error al actualizar la información del paciente en la base de datos.");
        }
    });
}
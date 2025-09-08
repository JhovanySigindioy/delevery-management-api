// src/services/envioDomicilio.service.ts
import { ManagementEntrega } from "../interfaces/managementEntrega";
import { sendDataDeliveryCompany } from "../api/apiGgo";

export async function processDeliveriesService(entrega: ManagementEntrega) {
    if (!entrega) throw new Error("No se envió ninguna entrega.");
    if (!entrega.nombrePaciente || !entrega.direccion) {
        throw new Error(`Entrega inválida: falta nombre o dirección (${entrega.radicadoTipoNumero})`);
    }
    return await sendDataDeliveryCompany(entrega);
}


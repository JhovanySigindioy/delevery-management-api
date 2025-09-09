// src/services/envioDomicilio.service.ts
import { ManagementEntrega } from "../interfaces/managementEntrega";
import { sendDataDeliveryCompany } from "../api/apiGgo";

export async function processDeliveriesService(entrega: ManagementEntrega) {
    if (!entrega) throw new Error("No delivery was provided.");
    if (!entrega.patientName || !entrega.address) {
        throw new Error(`Invalid delivery: missing patient name or address (${entrega.registeredTypeNumber})`);
    }
    return await sendDataDeliveryCompany(entrega);
}

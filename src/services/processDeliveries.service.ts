// src/services/envioDomicilio.service.ts

import { sendDataDeliveryCompany } from "../api/apiGgo";
import { ManagementEntregaRequest } from "../interfaces";

export async function processDeliveriesService(entrega: ManagementEntregaRequest) {
    if (!entrega) throw new Error("No delivery was provided.");
    if (!entrega.patientName || !entrega.address) {
        throw new Error(`Invalid delivery: missing patient name or address (${entrega.registeredTypeNumber})`);
    }
    return await sendDataDeliveryCompany(entrega);
}

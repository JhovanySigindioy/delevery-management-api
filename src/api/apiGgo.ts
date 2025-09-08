// src/api/apiGgo.ts
import axios from "axios";
import { GgoRequest } from "../interfaces/ggoApi";
import { ManagementEntrega } from "../interfaces/managementEntrega";
import { env } from "../config";

export async function sendDataDeliveryCompany(entrega: ManagementEntrega): Promise<any> {
    const fechaDomicilio = entrega.fechaDomicilio
        ? entrega.fechaDomicilio.split("T")[0]
        : null;
    const fechaDomicilioForRoute = entrega.fechaDomicilio
        ? new Date(entrega.fechaDomicilio).toISOString().split("T")[0]
        : null;
    const payload: GgoRequest = {
        orderNumber: entrega.radicadoTipoNumero.trim(),
        customerName: entrega.nombrePaciente,
        address: entrega.direccion,
        managementType: 1,
        route: { scheduleDate: fechaDomicilioForRoute || "" },
        deliveryPlannedDate: fechaDomicilio || undefined,
        phone: entrega.contacto1 || undefined,
        cellphone: entrega.contacto2 || undefined,  
        email: entrega.correo || undefined,
        comments: entrega.observaciones || undefined,
        fromHour: entrega.horaDomicilio || undefined,
        toHour: undefined,
    };

    try {
        const response = await axios.post(env.apiDeliveryCompany.urlShippings, payload);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Error al enviar la entrega ${entrega.radicadoTipoNumero}:`, error.message);
        throw new Error(error.message || "Error al enviar entrega a GGo");
    }
}

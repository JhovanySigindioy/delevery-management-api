// src/api/apiGgo.ts
import axios from "axios";
import { GgoRequest } from "../interfaces/ggoApi";
import { ManagementEntrega } from "../interfaces/managementEntrega";
import { env } from "../config";

export async function sendDataDeliveryCompany(entrega: ManagementEntrega): Promise<any> {
    const deliveryDate = entrega.deliveryDate
        ? entrega.deliveryDate.split("T")[0]
        : null;

    const deliveryDateForRoute = entrega.deliveryDate
        ? new Date(entrega.deliveryDate).toISOString().split("T")[0]
        : null;

    const payload: GgoRequest = {
        orderNumber: entrega.registeredTypeNumber.trim(),
        customerName: entrega.patientName,
        address: entrega.address,
        managementType: 1,
        route: { scheduleDate: deliveryDateForRoute || "" },
        deliveryPlannedDate: deliveryDate || undefined,
        phone: entrega.primaryPhone || undefined,
        cellphone: entrega.secondaryPhone || undefined,
        email: entrega.email || undefined,
        comments: entrega.notes || undefined,
        fromHour: entrega.deliveryTime || undefined,
        toHour: undefined,
    };

    try {
        const response = await axios.post(env.apiDeliveryCompany.urlShippings, payload);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Error sending delivery ${entrega.registeredTypeNumber}:`, error.message);
        throw new Error(error.message || "Error sending delivery to GGo");
    }
}

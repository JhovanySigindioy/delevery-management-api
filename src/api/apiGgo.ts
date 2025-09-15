// src/api/apiGgo.ts
import axios from "axios";
import { GgoRequest } from "../interfaces/ggoApi";
import { env } from "../config";
import { ManagementEntregaRequest } from "../interfaces";

// helper para formatear fechas en Colombia a YYYY-MM-DD
function formatDateColombia(dateStr: string): string {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// helper para formatear fecha+hora en Colombia a ISO UTC
function formatDateTimeUTC(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toISOString(); // GGO espera UTC
}

// helper para formatear solo hora local a HH:mm:ss
function formatTimeColombia(timeStr: string): string {
    const parts = timeStr.split(":").map(Number);
    if (parts.length < 2 || parts.some(isNaN)) {
        throw new Error("Formato de hora inválido");
    }
    const [hours, minutes, seconds] = parts;
    const d = new Date(2000, 0, 1);
    d.setHours(hours, minutes, seconds || 0, 0);
    return d.toTimeString().split(" ")[0]; // HH:mm:ss
}

export async function sendDataDeliveryCompany(
    entrega: ManagementEntregaRequest
): Promise<any> {
    const deliveryDate = entrega.deliveryDate
        ? formatDateColombia(entrega.deliveryDate)
        : null;

    const deliveryDateForRoute = entrega.deliveryDate
        ? formatDateColombia(entrega.deliveryDate)
        : null;

    const payload: GgoRequest = {
        orderNumber: entrega.registeredTypeNumber.trim(),
        customerName: entrega.patientName,
        address: entrega.address,
        addressAdd: "",
        managementType: 1,
        phone: entrega.primaryPhone || undefined,
        cellphone: entrega.secondaryPhone || undefined,
        email: entrega.email || undefined,
        comments: entrega.notes || undefined,
        fromHour: entrega.deliveryTime ? formatTimeColombia(entrega.deliveryTime) : undefined,
        toHour: entrega.deliveryTime ? formatTimeColombia(entrega.deliveryTime) : undefined,
        deliveryPlannedDate: entrega.deliveryDate
            ? formatDateTimeUTC(entrega.deliveryDate)
            : undefined,
        route: {
            scheduleDate: deliveryDateForRoute || "",
            priority: entrega.isUrgent ? 1 : 3, // 🔹 Urgente = prioridad más alta
        },
        dispensary: {
            code: entrega.pharmacy?.pharmacyCode || "",
            name: entrega.pharmacy?.name || "",
            location: {
                countryCode: entrega.pharmacy?.location.countryCode || "",
                departmentCode: entrega.pharmacy?.location.departmentCode || "",
                cityCode: entrega.pharmacy?.location.municipalityCode || "",
                address: entrega.pharmacy?.location.address || "",
            }
        }
    };

    try {
        const response = await axios.post(
            env.apiDeliveryCompany.urlShippings,
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error(
            `❌ Error al enviar la entrega a GGO ${entrega.registeredTypeNumber}:`,
            error.message
        );
        throw new Error(error.message || "Error al enviar la entrega a GGO");
    }
}

// src/interfaces/ggoApi.ts
export interface GgoRequest {
    orderNumber: string;
    customerName: string;
    address: string;
    managementType: number;

    route?: {
        scheduleDate: string;
    };

    phone?: string;       // ✅ opcional
    cellphone?: string;   // ✅ opcional
    email?: string;
    comments?: string;
    fromHour?: string;
    toHour?: string;
    deliveryPlannedDate?: string;

    products?: Array<{
        name: string;
        quantity?: number;
        packageUnit?: number;
    }>;
}

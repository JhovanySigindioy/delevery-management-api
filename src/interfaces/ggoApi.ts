// src/interfaces/ggoApi.ts
export interface GgoRequest {
    orderNumber: string;
    customerName: string;
    address: string;
    addressAdd?: string;
    managementType: number;

    route?: {
        scheduleDate: string;
        priority?: number;
    };

    dispensary?: {
        code: string;
        name: string;
        location: {
            countryCode: string;
            departmentCode: string;
            cityCode: string;
            address: string;
        }
    };

    phone?: string;
    cellphone?: string;
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

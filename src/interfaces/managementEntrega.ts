// src/interfaces/managementEntrega.ts
export interface ManagementEntregaRequest {
    patientName: string;
    registeredTypeNumber: string;
    identification: string;
    primaryPhone: string;
    secondaryPhone?: string | null;
    email?: string | null;
    address: string;

    managementDate: string;
    managementTime: string;

    deliveryDate?: string | null;
    deliveryTime?: string | null;

    packageType: string;
    callResult: string;
    notes?: string | null;
    isUrgent?: boolean;
    sentToHome: boolean;

    pharmacyCode: string;
}

export interface ManagementEntregaResponse {
    registeredTypeNumber: string;
    patientName: string;
    identification: string;
    primaryPhone: string;
    secondaryPhone: string | null;
    email: string | null;
    address: string;
    managementDate: string;
    managementTime: string;
    deliveryDate: string | null;
    deliveryTime: string | null;
    packageType: string | null;
    callResult: string | null;
    notes: string | null;
    pharmacistId: string;
    isUrgent: boolean;
    sentToHome: boolean;
    managementId: number;
}




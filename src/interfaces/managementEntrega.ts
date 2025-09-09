// src/interfaces/managementEntrega.ts
export interface ManagementEntrega {
    registeredTypeNumber: string;
    patientName: string;
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
    pharmacistId: string;
    isUrgent?: boolean;
    sentToHome: boolean;
}




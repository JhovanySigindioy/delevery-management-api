import { Request, Response } from "express";
import { updatePatientDeliveryInfoService } from "../services/patient.service";
import { ApiResponse } from "../interfaces/apiResponse";
import { DatabaseError } from "../utils/errors";
import { PatientDeliveryInfo } from "../interfaces/patient";
import { logger } from "../utils";

export const updatePatientDeliveryInfoController = async (req: Request, res: Response) => {
    try {
        const { identification } = req.params;
        const { namePatient, primaryPhone, secondaryPhone, email, address } = req.body;

        const patientData: PatientDeliveryInfo = {
            identification,
            namePatient,
            primaryPhone,
            secondaryPhone,
            email,
            address,
        };

        await updatePatientDeliveryInfoService(patientData);

        const response: ApiResponse = {
            success: true,
            data: null,
            error: null,
        };

        return res.status(200).json(response);

    } catch (error) {
        logger.error("❌ Error en el controlador:", error);

        let errorMessage = "Error interno del servidor.";
        if (error instanceof DatabaseError) {
            errorMessage = error.message;
        }

        const response: ApiResponse = {
            success: false,
            data: null,
            error: errorMessage,
        };

        return res.status(500).json(response);
    }
};

import { Router } from "express";
import { getContractDataController } from "../controller/contract.controller";
import { contractRequestMiddleware } from "../middleware/contractRequest.middleware";
import { formulaRequestMiddleware } from "../middleware/formulaRequest.middleware";
import { createEntregaController } from "../controller/entregas.controller";
import { getFormulaDataController } from "../controller/formula.controller";
import { updatePatientDeliveryInfoController } from "../controller/patient.controller";

export const router: Router = Router();
//Obtenemos data de contrato y ubicacion de la farmacia
router.get("/contract", contractRequestMiddleware, getContractDataController);

//Obtenemos data de formula (data del paciente)
router.get("/formula", formulaRequestMiddleware, getFormulaDataController);

//Enviamos entregas a la empresa de domicilios
router.post("/management-entregas", createEntregaController);

//Actualizar datos del paciente
router.patch("/patient/:identification", updatePatientDeliveryInfoController);
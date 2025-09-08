import { Router } from "express";
import { getContractDataController } from "../controller/getContractData.controller";
import { contractRequestMiddleware } from "../middleware/contractRequest.middleware";
import { formulaRequestMiddleware } from "../middleware/formulaRequest.middleware";
import { createEntregaController } from "../controller/entregas.controller";
import { getFormulaDataController } from "../controller/getFormulaData.controller";

export const router: Router = Router();
//Obtenemos data de contrato y ubicacion de la farmacia
router.get("/contract", contractRequestMiddleware, getContractDataController);

//Obtenemos data de formula (data del paciente)
router.get("/formula", formulaRequestMiddleware, getFormulaDataController);

//Enviamos entregas a la empresa de domicilios
router.post("/management-entregas", createEntregaController);
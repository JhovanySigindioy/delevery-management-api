// src/controllers/entregas/exportEntregasExcelController.ts
import { Response } from "express";
import { getEntregasByDateService } from "../services/exportEntregas.service";
import { DatabaseError, logger } from "../utils";
import { generateEntregasExcel } from "../services/excelExport.service";
import { AuthenticatedRequest } from "../middleware";
import { format } from "date-fns-tz";

export const exportEntregasExcelController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const payload = req.jwtPayload as { id: string };
        const pharmacistId = payload?.id;

        if (!pharmacistId) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "No se pudo obtener el regente desde el token",
            });
        }

        // Fecha actual en Colombia
        const today = format(new Date(), "yyyy-MM-dd", { timeZone: "America/Bogota" });

        const entregas = await getEntregasByDateService(pharmacistId, today);

        if (!entregas || entregas.length === 0) {
            throw new DatabaseError("No se encontraron entregas para la fecha actual.");
        }

        const buffer = await generateEntregasExcel(entregas);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename=entregas_${today}.xlsx`);

        return res.send(buffer);
    } catch (error) {
        logger.error("❌ Error en exportEntregasExcelController:", error);

        return res.status(500).json({
            success: false,
            data: null,
            error: error instanceof DatabaseError
                ? error.message
                : "Error interno del servidor al exportar Excel.",
        });
    }
};

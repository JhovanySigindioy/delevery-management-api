// src/middleware/contractRequest.middleware.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils";

export function contractRequestMiddleware(req: Request, res: Response, next: NextFunction) {
    const { nit, userId } = req.query;
    logger.info(`Middleware - Validando request de contrato: NIT=${nit}, idUsuario=${userId}`);
    //  Valida que ambos parametros existan
    if (!nit || !userId) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "Debe enviar NIT e idUsuario",
        });
    }

    //  Valida que NIT solo contenga números
    if (!/^\d+$/.test(nit as string) && !/^\d+$/.test(userId as string)) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "El NIT y el Usuario debe contener sólo números",
        });
    }

    //  Sanitiza data
    req.query.nit = (nit as string).trim();
    req.query.userId = (userId as string).trim();

    next();
}

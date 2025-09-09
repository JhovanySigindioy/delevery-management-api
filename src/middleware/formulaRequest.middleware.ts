import { Request, Response, NextFunction } from "express";

export function formulaRequestMiddleware(req: Request, res: Response, next: NextFunction) {
    const { registeredTypeNumber, dispensaryCode } = req.query;

    //  Valida que ambos parametros existan
    if (!registeredTypeNumber || !dispensaryCode) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "Se esperaba radicado ó tipo-numero y dispensaryCode",
        });
    }

    //  Sanitiza data
    req.query.registeredTypeNumber = (registeredTypeNumber as string).trim();
    req.query.dispensaryCode = (dispensaryCode as string).trim();

    next();
}
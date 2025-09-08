import { Request, Response, NextFunction } from "express";

export function formulaRequestMiddleware(req: Request, res: Response, next: NextFunction) {
    const { valor, bodega } = req.query;

    //  Valida que ambos parametros existan
    if (!valor || !bodega) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "Se esperaba radicado ó tipo-numero y bodega",
        });
    }

    //  Sanitiza data
    req.query.valor = (valor as string).trim();
    req.query.bodega = (bodega as string).trim();

    next();
}
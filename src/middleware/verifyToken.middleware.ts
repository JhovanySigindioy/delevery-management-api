// src/middlewares/verifyTokenMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
    jwtPayload?: JwtPayload | string;
}

export function verifyTokenMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const secret = env.jwtData.jwt_secret || "";

    //  Valida encabezado Authorization
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            data: null,
            error: "Token JWT es obligatorio en el encabezado Authorization",
        });
    }

    //  Extraer token
    const token = authHeader.split(" ")[1]; // formato: "Bearer <token>"
    if (!token) {
        return res.status(401).json({
            success: false,
            data: null,
            error: "Formato de token inválido, use 'Bearer <token>'",
        });
    }

    //  Verifica y decodifica el token
    try {
        const decoded = jwt.verify(token, secret);
        logger.info(` Token JWT válido. Payload: ${JSON.stringify(decoded)}`);

        // Guardar payload en la request para el controller
        req.jwtPayload = decoded;

        next();
    } catch (err) {
        logger.warn(" Token inválido o expirado");
        return res.status(401).json({
            success: false,
            data: null,
            error: "Token JWT inválido o expirado",
        });
    }
}

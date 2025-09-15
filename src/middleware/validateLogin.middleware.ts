import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateLogin = [
    body("idUsers")
        .trim()
        .notEmpty().withMessage("El campo 'Usuario' es obligatorio.")
        .isString().withMessage("'Usuario' debe ser un texto."),
    body("password")
        .trim()
        .notEmpty().withMessage("El campo 'Contraseña' es obligatorio.")
        .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres."),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                data: null,
                error: errors.array().map((err: any) => err.msg).join(", "),
            });
        }
        next();
    },
];

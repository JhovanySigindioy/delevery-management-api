import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

//Personalizamos formato de presentacion de los errores
const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
});

export const logger = createLogger({
    level: 'info',
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), //Usado para ver trazas de error
        customFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' })
    ],
    exitOnError: false,
});

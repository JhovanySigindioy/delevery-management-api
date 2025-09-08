import dbClient from 'mssql'
import { logger } from '../utils/logger';
import { env } from './env';

export const connectToDatabase = async () => {
    try {
        const pool = await dbClient.connect({
            user: env.dbData.db_user,
            password: env.dbData.db_password,
            server: env.dbData.db_host,
            database: env.dbData.db_name,
            port: env.dbData.db_port,
            options: {
                encrypt: true,
                trustServerCertificate: true,
            }
        });
        logger.info("Conexión a la base de datos exitosa");
        return pool;
    } catch (error: unknown) {
        logger.error("Error al intentar conectar a la base de datos:", error);
        throw error;
    }
}
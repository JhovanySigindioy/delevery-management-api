import dbClient from "mssql";
import { logger } from "../utils/logger";
import { env } from "./env";

let pool: dbClient.ConnectionPool | null = null;

export const connectToDatabase = async (): Promise<dbClient.ConnectionPool> => {
  if (pool) {
    if (!pool.connected) {
      logger.warn("⚠️ Pool desconectado, reinicializando...");
      pool = null;
    } else {
      return pool;
    }
  }

  try {
    pool = await new dbClient.ConnectionPool({
      user: env.dbData.db_user,
      password: env.dbData.db_password,
      server: env.dbData.db_host,
      database: env.dbData.db_name,
      port: env.dbData.db_port,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
      pool: {
        max: 20,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    }).connect();

    logger.info("✅ Conexión a la base de datos establecida.");

    pool.on("error", (err) => {
      logger.error("❌ Error en el pool de la base de datos:", err);
      pool = null;
    });

    return pool;
  } catch (error: unknown) {
    logger.error("❌ Error al intentar conectar a la base de datos:", error);
    throw error;
  }
};

export const closeDatabaseConnection = async () => {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      logger.info("🛑 Pool cerrado correctamente.");
    } catch (err) {
      logger.error("❌ Error al cerrar el pool:", err);
    }
  }
};

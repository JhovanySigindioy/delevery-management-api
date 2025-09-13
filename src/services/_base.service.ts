import sql from "mssql";
import { connectToDatabase } from "../config";
import { logger } from "../utils/logger";

export async function runQuery<T>(
  queryFn: (pool: sql.ConnectionPool) => Promise<T>
): Promise<T | null> {
  try {
    const pool = await connectToDatabase();
    return await queryFn(pool);
  } catch (error) {
    logger.error("❌ Error ejecutando query:", error);
    return null;
  }
}

export async function runTransaction<T>(
  transactionFn: (tx: sql.Transaction) => Promise<T>
): Promise<T | null> {
  const pool = await connectToDatabase();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const result = await transactionFn(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    logger.error("❌ Error en transacción:", error);
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      logger.error("❌ Error al hacer rollback:", rollbackError);
    }
    return null;
  }
}

import { connectToDatabase } from "../config";
import { logger, formatTipoNumero } from "../utils";
import { FormulaData } from "../interfaces/serviceV1Ponal";
import { ApiResponse } from "../interfaces/apiResponse";
import { getDataRadicado } from "../api/apiPonalV1";

// Interfaz para el formato de respuesta unificado
export interface IUnifiedResponse {
  identificacion: string | null;
  nombre: string | null;
  telefonos: string | null;
  correo: string | null;
  direccion: string | null;
  numeroFormula: string | null;
  error: string | null;
}

export async function getFormulaDataService(valor: string, bodega: string): Promise<IUnifiedResponse> {
  let pool;
  try {
    pool = await connectToDatabase();

    let identificacion: string | null = null;
    let numeroFormula: string | null = null;
    let nombre: string | null = null;
    let telefonos: string | null = null;
    let correo: string | null = null;
    let direccion: string | null = null;

    // Caso 1: es un radicado
    if (/^\d+$/.test(valor)) {
      // 1. Validar el radicado en la BD local
      const result = await pool.request()
        .input("radicado", valor)
        .query<{ NumeroFormula: string }>(`
          SELECT NumeroFormula
          FROM POS_Encabezado_Tirilla
          WHERE NumeroFormula = @radicado
        `);

      const numeroFormulaLocal = result.recordset[0]?.NumeroFormula || null;
      if (!numeroFormulaLocal) {
        return {
          identificacion,
          nombre,
          telefonos,
          correo,
          direccion,
          numeroFormula,
          error: "No se encontró el radicado en la base de datos del dispensario"
        };
      }

      // 2. Consumir la API externa para obtener la información de la fórmula
      const apiResponse: ApiResponse<FormulaData[]> = await getDataRadicado(numeroFormulaLocal, bodega);

      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        const formula = apiResponse.data[0];
        identificacion = formula.idPaciente || null;
        nombre = formula.llavePaciente || null;
        numeroFormula = formula.formula || null;

        // 3. Si se obtuvo la identificación, buscar datos de contacto y dirección en la tabla local
        if (identificacion) {
          const domicilioResult = await pool.request()
            .input("identificacion", identificacion)
            .query(`
              SELECT contacto1, contacto2, direccion, correo
              FROM DatosPacientesDomicilios
              WHERE identificacion = @identificacion
            `);

          if (domicilioResult.recordset && domicilioResult.recordset.length > 0) {
            const domicilio = domicilioResult.recordset[0];
            telefonos = (domicilio.contacto1 || '') + (domicilio.contacto2 ? `, ${domicilio.contacto2}` : '');
            direccion = domicilio.direccion || null;
            correo = domicilio.correo || null;
          }
        }
      } else if (apiResponse.error) {
        return {
          identificacion,
          nombre,
          telefonos,
          correo,
          direccion,
          numeroFormula,
          error: apiResponse.error
        };
      }
    } else {
      // Caso 2: es tipo y número (información en BD local)
      const { tipo, numero } = formatTipoNumero(valor);
      const result = await pool.request()
        .input("tipo", tipo)
        .input("numero", numero)
        .query(`
          SELECT 
            E.NumeroFormula,
            E.Nombre, 
            E.Telefono, 
            E.Direccion,
            E.Correo
          FROM POS_Encabezado_Tirilla AS E
          WHERE E.Tipo = @tipo AND E.Numero = @numero
        `);

      if (result.recordset && result.recordset.length > 0) {
        const record = result.recordset[0];
        numeroFormula = record.NumeroFormula || null;
        nombre = record.Nombre || null;
        telefonos = record.Telefono || null;
        direccion = record.Direccion || null;
        correo = record.Correo || null;
      } else {
        return {
          identificacion,
          nombre,
          telefonos,
          correo,
          direccion,
          numeroFormula,
          error: "No se encontró información para este tipo/número de fórmula"
        };
      }
    }

    // Retornar el objeto unificado
    return { identificacion, nombre, telefonos, correo, direccion, numeroFormula, error: null };
  } catch (error) {
    logger.error("Error en getFormulaDataService:", error);
    return {
      identificacion: null,
      nombre: null,
      telefonos: null,
      correo: null,
      direccion: null,
      numeroFormula: null,
      error: `Error al procesar la solicitud: ${error instanceof Error ? error.message : "Error desconocido"}`,
    };
  } finally {
    if (pool) {
      try { pool.close(); } catch (closeError) {
        logger.error("Error cerrando la conexión a la base de datos:", closeError);
      }
    }
  }
}

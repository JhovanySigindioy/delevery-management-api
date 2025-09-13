import { connectToDatabase } from "../config";
import { logger } from "../utils";
import { FormulaData } from "../interfaces/serviceV1Ponal";
import { ApiResponse } from "../interfaces/apiResponse";
import { getDataRegistered } from "../api/apiPonalV1";

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

export async function getFormulaDataService(
  registeredTypeNumber: string,
  dispensaryCode: string
): Promise<IUnifiedResponse> {
  try {
    const pool = await connectToDatabase();

    let identificacion: string | null = null;
    let numeroFormula: string | null = null;
    let nombre: string | null = null;
    let telefonos: string | null = null;
    let correo: string | null = null;
    let direccion: string | null = null;

    //  Paso 1: Consultar API externa
    const apiResponse: ApiResponse<FormulaData[]> = await getDataRegistered(
      registeredTypeNumber,
      dispensaryCode
    );

    if (!apiResponse.success || !apiResponse.data || apiResponse.data.length === 0) {
      return {
        identificacion: null,
        nombre: null,
        telefonos: null,
        correo: null,
        direccion: null,
        numeroFormula: null,
        error: apiResponse.error || "No se encontró información en la API externa",
      };
    }

    // Datos básicos desde la API
    const formula = apiResponse.data[0];
    identificacion = formula.idPaciente || null;
    nombre = formula.llavePaciente || null;
    numeroFormula = formula.formula || null;

    //  Paso 2: Complementar con la BD local
    if (identificacion) {
      const domicilioResult = await pool.request()
        .input("identificacion", identificacion)
        .query(`
          SELECT contacto1, contacto2, direccion, correo
          FROM DatosPacientesDomicilios
          WHERE identificacion = @identificacion
        `);

      if (domicilioResult.recordset.length > 0) {
        const domicilio = domicilioResult.recordset[0];
        telefonos = (domicilio.contacto1 || "") +
          (domicilio.contacto2 ? `, ${domicilio.contacto2}` : "");
        direccion = domicilio.direccion || null;
        correo = domicilio.correo || null;
      }
    }

    //  Respuesta unificada
    return {
      identificacion,
      nombre,
      telefonos,
      correo,
      direccion,
      numeroFormula,
      error: null,
    };
  } catch (error) {
    logger.error("❌ Error en getFormulaDataService:", error);
    return {
      identificacion: null,
      nombre: null,
      telefonos: null,
      correo: null,
      direccion: null,
      numeroFormula: null,
      error: `Error al procesar la solicitud: ${error instanceof Error ? error.message : "Error desconocido"
        }`,
    };
  }
}

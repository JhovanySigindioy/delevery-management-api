import { runQuery } from "./_base.service";

export interface IPharmacyResponse {
  name: string | null;
  city: string | null;
  pharmacyCode: string | null;
}

export interface IContractResponse {
  contract: string | null;
  pharmacy: IPharmacyResponse | null;
  error: string | null;
}

export async function getContractDataService(
  nit: string,
  userId: string
): Promise<IContractResponse> {
  return runQuery(async (pool) => {
    const contractResult = await pool
      .request()
      .input("nit", nit)
      .query<{ Nombre: string }>(
        `SELECT Nombre FROM InfoClientes WHERE IdClientes = @nit`
      );

    const contract = contractResult.recordset[0]?.Nombre || null;
    if (!contract) {
      return { contract: null, pharmacy: null, error: "No se encontró contrato con ese NIT" };
    }

    const pharmacyResult = await pool
      .request()
      .input("userId", userId)
      .query<{ pos: string; punto_venta_outlook: string; ciudad: string }>(`
        SELECT f.pos, f.punto_venta_outlook, f.ciudad
        FROM UsuariosPermisos u
        INNER JOIN dw__dim_pos f ON f.pos = u.Menu
        WHERE IdUsuario = @userId AND programa = 4548
      `);

    const pharmacy = pharmacyResult.recordset[0]
      ? {
        name: pharmacyResult.recordset[0].punto_venta_outlook,
        city: pharmacyResult.recordset[0].ciudad,
        pharmacyCode: pharmacyResult.recordset[0].pos,
      }
      : null;

    return {
      contract,
      pharmacy,
      error: pharmacy ? null : "No se encontraron datos de farmacia para ese usuario",
    };
  }) as Promise<IContractResponse>;
}

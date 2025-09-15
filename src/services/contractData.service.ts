import { runQuery } from "./_base.service";

export interface IPharmacyResponse {
  name: string | null;
  city: string | null;
  pharmacyCode: string | null;
  address: string | null;
  departmentCode: string | null;
  municipalityCode: string | null;
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
    // 1. Buscar el contrato en InfoClientes
    const contractResult = await pool
      .request()
      .input("nit", nit)
      .query<{ Nombre: string }>(
        `SELECT Nombre FROM InfoClientes WHERE IdClientes = @nit`
      );

    const contract = contractResult.recordset[0]?.Nombre || null;
    if (!contract) {
      return {
        contract: null,
        pharmacy: null,
        error: "No se encontró contrato con ese NIT",
      };
    }

    // 2. Buscar farmacia y ciudad/departamento
    const pharmacyResult = await pool
      .request()
      .input("userId", userId)
      .query<{
        pos: string;
        punto_venta_outlook: string;
        ciudad: string;
        direccion_drogueria: string;
        IdCiudad: string;
        IdDepartamento: string;
      }>(`
    SELECT 
      f.pos,
      f.punto_venta_outlook,
      f.ciudad,
      f.direccion_drogueria,
      c.IdCiudad,
      c.IdDepartamento
    FROM UsuariosPermisos u
    INNER JOIN dw__dim_pos f ON f.pos = u.Menu
    INNER JOIN Clientes cli ON cli.IdClientes = f.pos
    INNER JOIN Ciudad c ON c.IdCiudad = cli.IdCiudad
    WHERE u.IdUsuario = @userId 
      AND u.programa = 4548
  `);


    const row = pharmacyResult.recordset[0];

    const pharmacy = row
      ? {
        name: row.punto_venta_outlook,
        city: row.ciudad,
        address: row.direccion_drogueria,
        pharmacyCode: row.pos,
        departmentCode: row.IdDepartamento,
        municipalityCode: row.IdCiudad,
      }
      : null;

    return {
      contract,
      pharmacy,
      error: pharmacy
        ? null
        : "No se encontraron datos de farmacia para ese usuario",
    };
  }) as Promise<IContractResponse>;
}

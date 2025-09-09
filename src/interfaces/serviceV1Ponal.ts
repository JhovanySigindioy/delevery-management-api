
// src/interfaces/serviceV1Ponal.ts

//  Tipo de datos esperados en en la respuesta del api ponal "data"
export interface FormulaData {
  formula: string;
  evento: string;
  evolucion: number;
  idPaciente: string;
  llavePaciente: string;
  tipoAmbito: string;
  ambito: string;
  observacion: string;
  fechaEvolucion: string;
  loginProfesional: string;
  codigoPlanAf: string;
  cantidad: number;
  descripcionInsumos: string;
  detalleDosis: string;
  codigoMolecula: string;
}

// Payload del request
export interface ServiceV1PonalRequest {
  Datos: {
    numRadicado: string;
    dispensario: string;
  };
  Servicio: string;
}
// Define la interfaz para una respuesta exitosa
export interface AuthSuccessResponse {
  iduser: number;
  main: string[];
  message: string;
  modality: string;
  name: string;
  nit: string;
  program: number;
  tokenjwt: string;
}

// Define la interfaz para un error de autenticación de la API
export interface AuthErrorResponse {
  message: string;
  succes: "false";
}

// Usa un tipo de unión para la respuesta
export type LoginApiResponse = AuthSuccessResponse | AuthErrorResponse;

export function formatTipoNumero(valor: string): { tipo: string | null; numero: string | null } {
  if (valor.includes("-")) {
    const [tipo, numero] = valor.split("-");
    return { tipo, numero };
  }
  return { tipo: null, numero: null };
}
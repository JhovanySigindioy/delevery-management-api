export function formatTypeNumber(typeNumber: string): { type: string | null; number: string | null } {
  if (typeNumber.includes("-")) {
    const [type, number] = typeNumber.split("-");
    return { type, number };
  }
  return { type: null, number: null };
}
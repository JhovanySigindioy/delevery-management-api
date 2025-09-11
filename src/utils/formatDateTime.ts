// src/utils/formatDateTime.ts
import { format } from "date-fns";

// Igual que en frontend
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatTime(date: Date): string {
  return format(date, "HH:mm:ss");
}

// Combinar fecha + hora local -> UTC para GGo
export function combineToUtc(date: string, time: string): string {
  const local = new Date(`${date}T${time}:00-05:00`); // Colombia
  return local.toISOString();
}
// Cumple con el reuisito de la base de datos 
export function toSqlTime(timeStr: string | null): Date | null {
  if (!timeStr) return null;
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  const d = new Date(2000, 0, 1); // fecha dummy
  d.setHours(hours, minutes, seconds || 0, 0);
  return d;
}
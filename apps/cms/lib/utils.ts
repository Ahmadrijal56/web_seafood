import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

export function toNumberOrNull(value: string): number | null {
  const n = Number(String(value).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", "."));
  return value.trim() === "" || Number.isNaN(n) ? null : n;
}

/** `2026-10-14T10:00:00Z` → nilai untuk `<input type="datetime-local">` (WIB). */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return d.toISOString().slice(0, 16);
}

export function fromLocalInput(value: string): string | null {
  return value ? new Date(`${value}:00+07:00`).toISOString() : null;
}

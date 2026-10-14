const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  return rupiah.format(Math.round(value)).replace(/\u00a0/g, " ");
}

/** "Rp 95rb" — untuk tampilan ringkas. */
export function formatRupiahShort(value: number): string {
  if (value >= 1_000_000) {
    const jt = value / 1_000_000;
    return `Rp ${jt.toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  }
  if (value >= 1000) {
    return `Rp ${(value / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb`;
  }
  return formatRupiah(value);
}

export function formatKg(value: number): string {
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg`;
}

export function formatDateLong(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value.length === 10 ? `${value}T12:00:00+07:00` : value) : value;
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

/** Tanggal hari ini di zona Asia/Jakarta, format YYYY-MM-DD. */
export function todayJakarta(offsetDays = 0): string {
  const now = new Date(Date.now() + offsetDays * 86_400_000);
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

/** Normalisasi nomor HP Indonesia ke format 62xxxxxxxx. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function isValidPhone(value: string): boolean {
  const normalized = normalizePhone(value);
  return /^628\d{7,12}$/.test(normalized);
}

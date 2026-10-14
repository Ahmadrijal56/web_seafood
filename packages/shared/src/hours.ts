export interface OpeningHours {
  /** "04:00" */
  open: string;
  /** "16:00" */
  close: string;
  /** 0 = Minggu ... 6 = Sabtu */
  days: number[];
}

export const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function jakartaNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export interface OpenStatus {
  isOpen: boolean;
  label: string;
}

export function openStatus(hours: OpeningHours, now = new Date()): OpenStatus {
  const { day, minutes } = jakartaNow(now);
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const openToday = hours.days.includes(day);
  if (openToday && minutes >= open && minutes < close) {
    return { isOpen: true, label: `Buka sekarang · tutup ${hours.close} WIB` };
  }
  if (openToday && minutes < open) {
    return { isOpen: false, label: `Tutup · buka hari ini ${hours.open} WIB` };
  }
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    if (hours.days.includes(next)) {
      const when = i === 1 ? "besok" : DAY_NAMES[next];
      return { isOpen: false, label: `Tutup · buka ${when} ${hours.open} WIB` };
    }
  }
  return { isOpen: false, label: "Tutup" };
}

export function describeDays(days: number[]): string {
  if (days.length === 7) return "Setiap hari";
  return [...days].sort().map((d) => DAY_NAMES[d]).join(", ");
}

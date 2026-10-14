"use client";

import { buildQuoteMessage, isValidPhone, waLink } from "@sfs/shared";
import { useState } from "react";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import { useStore } from "./store-provider";
import { buttonClass } from "./ui";

const input =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export function QuoteForm() {
  const { settings } = useStore();
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    businessType: "Restoran",
    city: "",
    products: "",
    volume: "",
    frequency: "Harian",
    notes: "",
  });
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessName || !form.contactName || !form.products || !form.volume) {
      setError("Lengkapi nama usaha, kontak, produk, dan volume.");
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError("Nomor WhatsApp tidak valid.");
      return;
    }
    setError("");
    track("quote_request", null, { business: form.businessName, type: form.businessType });
    window.open(waLink(settings.whatsapp, buildQuoteMessage(form)), "_blank", "noopener");
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Nama usaha</span>
        <input className={input} value={form.businessName} onChange={set("businessName")} placeholder="Resto Bahari" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Jenis usaha</span>
        <select className={cn(input, "cursor-pointer")} value={form.businessType} onChange={set("businessType")}>
          {["Restoran", "Hotel", "Katering", "Cafe / Kedai", "Reseller", "Eksportir", "Lainnya"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Nama kontak</span>
        <input className={input} value={form.contactName} onChange={set("contactName")} placeholder="Nama PIC / purchasing" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">No. WhatsApp</span>
        <input className={input} value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" placeholder="0812xxxxxxx" />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Produk yang dibutuhkan</span>
        <input className={input} value={form.products} onChange={set("products")} placeholder="Udang vaname size 40, cumi, kakap fillet…" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Volume per kirim</span>
        <input className={input} value={form.volume} onChange={set("volume")} placeholder="Contoh: 50 kg" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Frekuensi</span>
        <select className={cn(input, "cursor-pointer")} value={form.frequency} onChange={set("frequency")}>
          {["Harian", "2–3x seminggu", "Mingguan", "Bulanan", "Sekali (event)", "Kontainer / ekspor"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Kota</span>
        <input className={input} value={form.city} onChange={set("city")} placeholder="Jakarta Selatan" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Catatan</span>
        <input className={input} value={form.notes} onChange={set("notes")} placeholder="Spesifikasi, jam kirim, dll." />
      </label>
      {error && <p className="text-sm font-semibold text-rose-600 sm:col-span-2">{error}</p>}
      <button type="submit" className={buttonClass("wa", "lg", "sm:col-span-2")}>
        <WhatsAppIcon size={20} /> Kirim Permintaan Penawaran
      </button>
    </form>
  );
}

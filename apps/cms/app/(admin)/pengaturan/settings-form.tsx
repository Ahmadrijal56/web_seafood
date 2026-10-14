"use client";

import { DAY_NAMES, isValidPhone, normalizePhone, type StoreSettings } from "@sfs/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RupiahInput } from "@/components/inputs";
import { SaveBar } from "@/components/save-bar";
import { useToast } from "@/components/toast";
import { Card, Field, Toggle } from "@/components/ui";
import { publishChanges } from "@/lib/actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(settings);
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const changedKeys = (Object.keys(form) as (keyof StoreSettings)[]).filter((k) => JSON.stringify(form[k]) !== JSON.stringify(saved[k]));

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setIn = <K extends keyof StoreSettings>(key: K, sub: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: { ...(f[key] as object), [sub]: value } }));

  async function save() {
    const phone = normalizePhone(form.whatsapp);
    if (!isValidPhone(phone)) return toast("Nomor WhatsApp tidak valid (contoh: 0877xxxxxxx)", "error");
    if (!form.store_name.trim()) return toast("Nama toko wajib diisi", "error");
    const next = { ...form, whatsapp: phone };
    const keys = (Object.keys(next) as (keyof StoreSettings)[]).filter((k) => JSON.stringify(next[k]) !== JSON.stringify(saved[k]));
    if (!keys.length) return;
    setSaving(true);
    const { error } = await supabaseBrowser()
      .from("settings")
      .upsert(keys.map((key) => ({ key, value: next[key] })));
    setSaving(false);
    if (error) return toast(error.message, "error");
    setForm(next);
    setSaved(next);
    const result = await publishChanges();
    toast(result.ok ? "Pengaturan disimpan & website diperbarui" : `Tersimpan (${result.message})`, result.ok ? "success" : "error");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 pb-24 lg:grid-cols-2">
      <Card title="Informasi toko">
        <div className="space-y-4">
          <Field label="Nama toko">
            <input className="input" value={form.store_name} onChange={(e) => set("store_name", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className="input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Nomor WhatsApp admin" hint="Semua tombol pesan & checkout diarahkan ke nomor ini">
            <input className="input" inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
          <Field label="Alamat lapak">
            <textarea className="input min-h-20" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Link Google Maps" hint="Untuk tombol Petunjuk Arah">
            <input className="input" value={form.maps_url} onChange={(e) => set("maps_url", e.target.value)} />
          </Field>
          <Field label="Link embed peta" hint="Google Maps → Bagikan → Sematkan peta → salin URL di dalam src=&quot;…&quot;">
            <input className="input" value={form.maps_embed_url} onChange={(e) => set("maps_embed_url", e.target.value)} />
          </Field>
        </div>
      </Card>

      <div className="space-y-6">
        <Card title="Jam operasional">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Buka">
              <input type="time" className="input" value={form.hours.open} onChange={(e) => setIn("hours", "open", e.target.value)} />
            </Field>
            <Field label="Tutup">
              <input type="time" className="input" value={form.hours.close} onChange={(e) => setIn("hours", "close", e.target.value)} />
            </Field>
          </div>
          <p className="mb-2 mt-4 text-xs font-bold text-slate-600">Hari buka</p>
          <div className="flex flex-wrap gap-2">
            {DAY_NAMES.map((name, day) => {
              const on = form.hours.days.includes(day);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIn("hours", "days", on ? form.hours.days.filter((d) => d !== day) : [...form.hours.days, day].sort())}
                  className={cn("rounded-xl border px-3 py-1.5 text-xs font-bold", on ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-400")}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Harga & pengiriman">
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <Toggle
                checked={form.show_prices}
                onChange={(v) => set("show_prices", v)}
                label="Tampilkan harga di website"
                description="Matikan jika harga sedang tidak menentu — semua produk jadi “Tanya Harga”."
              />
            </div>
            <Field label="Gratis ongkir mulai belanja" hint="Kosongkan untuk menonaktifkan. Bisa diatur khusus per area di menu Area & Ongkir.">
              <RupiahInput value={form.free_shipping_min?.toString() ?? ""} onChange={(v) => set("free_shipping_min", v ? Number(v) : null)} placeholder="Tidak ada" />
            </Field>
            <Field label="Catatan harga hari ini">
              <input className="input" value={form.today_price_note} onChange={(e) => set("today_price_note", e.target.value)} />
            </Field>
            <Field label="Pengumuman (bar paling atas)" hint="Kosongkan untuk menyembunyikan">
              <input className="input" value={form.announcement} onChange={(e) => set("announcement", e.target.value)} />
            </Field>
          </div>
        </Card>
      </div>

      <Card title="Sosial media">
        <div className="space-y-4">
          {(["instagram", "youtube", "tiktok"] as const).map((k) => (
            <Field key={k} label={k === "youtube" ? "YouTube" : k === "tiktok" ? "TikTok" : "Instagram"}>
              <input className="input" value={form.socials[k]} onChange={(e) => setIn("socials", k, e.target.value)} placeholder="https://…" />
            </Field>
          ))}
        </div>
      </Card>

      <Card title="Garansi & kepercayaan">
        <div className="space-y-4">
          <Field label="Garansi segar">
            <input className="input" value={form.guarantee.fresh} onChange={(e) => setIn("guarantee", "fresh", e.target.value)} />
          </Field>
          <Field label="Garansi berat">
            <input className="input" value={form.guarantee.weight} onChange={(e) => setIn("guarantee", "weight", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Berdiri sejak">
              <input className="input" inputMode="numeric" value={form.trust.since} onChange={(e) => setIn("trust", "since", Number(e.target.value.replace(/\D/g, "")) || 0)} />
            </Field>
            <Field label="Rating">
              <input className="input" value={form.trust.rating} onChange={(e) => setIn("trust", "rating", e.target.value)} />
            </Field>
            <Field label="Jumlah pelanggan">
              <input className="input" value={form.trust.customers} onChange={(e) => setIn("trust", "customers", e.target.value)} />
            </Field>
            <Field label="Mitra resto/katering">
              <input className="input" value={form.trust.partners} onChange={(e) => setIn("trust", "partners", e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Legalitas">
        <div className="space-y-4">
          <Field label="NIB">
            <input className="input" value={form.legal.nib} onChange={(e) => setIn("legal", "nib", e.target.value)} />
          </Field>
          <Field label="Sertifikat halal (opsional)">
            <input className="input" value={form.legal.halal} onChange={(e) => setIn("legal", "halal", e.target.value)} />
          </Field>
          <Field label="Lainnya (opsional)">
            <input className="input" value={form.legal.other} onChange={(e) => setIn("legal", "other", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Tracking iklan (opsional)">
        <div className="space-y-4">
          <Field label="Google Analytics 4 — Measurement ID" hint="Format: G-XXXXXXXXXX">
            <input className="input" value={form.pixels.ga4} onChange={(e) => setIn("pixels", "ga4", e.target.value.trim())} />
          </Field>
          <Field label="Meta (Facebook/Instagram) Pixel ID">
            <input className="input" inputMode="numeric" value={form.pixels.meta} onChange={(e) => setIn("pixels", "meta", e.target.value.trim())} />
          </Field>
          <Field label="TikTok Pixel ID">
            <input className="input" value={form.pixels.tiktok} onChange={(e) => setIn("pixels", "tiktok", e.target.value.trim())} />
          </Field>
        </div>
      </Card>

      <SaveBar saving={saving} dirty={changedKeys.length > 0} onSave={save} />
    </div>
  );
}

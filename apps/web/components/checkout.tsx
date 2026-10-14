"use client";

import { formatRupiah, isValidPhone, todayJakarta, type ShippingArea } from "@sfs/shared";
import { AlertCircle, ArrowLeft, Loader2, MapPin, ShoppingBag, Store, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cartSummary, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { CartLineRow } from "./cart-drawer";
import { FreeShippingBar } from "./free-shipping-bar";
import { useHydrated } from "./header";
import { WhatsAppIcon } from "./icons";
import { useStore } from "./store-provider";
import { buttonClass } from "./ui";

const PROFILE_KEY = "sfs-customer";
export const LAST_ORDER_KEY = "sfs-last-order";

function defaultDeliveryDate() {
  const hour = Number(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hourCycle: "h23" }));
  return todayJakarta(hour >= 12 ? 1 : 0);
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 aria-[invalid=true]:border-rose-400";

export function Checkout({ areas }: { areas: ShippingArea[] }) {
  const { settings } = useStore();
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    method: "delivery" as "delivery" | "pickup",
    address: "",
    areaId: "",
    date: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let saved: Partial<typeof form> = {};
    try {
      saved = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "{}");
    } catch {}
    setForm((f) => ({ ...f, ...saved, date: defaultDeliveryDate(), notes: "" }));
  }, []);

  const summary = cartSummary(lines, settings.show_prices);
  const area = areas.find((a) => a.id === form.areaId);
  const freeMin = area?.min_free_shipping ?? settings.free_shipping_min;
  const shipping = useMemo(() => {
    if (form.method === "pickup") return 0;
    if (!area) return null;
    if (freeMin && summary.subtotal >= freeMin) return 0;
    return area.fee;
  }, [form.method, area, freeMin, summary.subtotal]);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Nama wajib diisi";
    if (!isValidPhone(form.phone)) next.phone = "Masukkan nomor WhatsApp yang valid, contoh 0812xxxxxxx";
    if (form.method === "delivery") {
      if (!form.address.trim()) next.address = "Alamat wajib diisi";
      if (!form.areaId) next.areaId = "Pilih area pengiriman";
    }
    if (!form.date) next.date = "Pilih tanggal";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) {
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          method: form.method,
          address: form.address,
          area_id: form.areaId,
          delivery_date: form.date,
          notes: form.notes,
          items: lines.map((l) => ({ kind: l.kind, id: l.id, qty: l.qty, processing_id: l.processingId, notes: l.notes })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim pesanan");
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({ name: form.name, phone: form.phone, method: form.method, address: form.address, areaId: form.areaId }),
      );
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ ...data, method: form.method, createdAt: Date.now() }));
      clear();
      router.push("/pesanan/terkirim");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi.");
      setSubmitting(false);
    }
  }

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-slate-100" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-brand-50 text-brand-600">
          <ShoppingBag className="size-9" />
        </div>
        <h2 className="text-xl font-bold text-navy">Keranjang masih kosong</h2>
        <p className="text-slate-600">Pilih produk dulu, lalu kembali ke sini untuk memesan via WhatsApp.</p>
        <Link href="/produk" className={buttonClass("coral", "lg")}>Lihat Produk</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-navy">Pesanan Anda ({lines.length})</h2>
            <Link href="/produk" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
              <ArrowLeft className="size-4" /> Tambah produk
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {lines.map((line) => (
              <CartLineRow key={line.key} line={line} />
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold text-navy">Data pemesan</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy">Nama</span>
              <input className={inputClass} value={form.name} onChange={set("name")} autoComplete="name" placeholder="Nama lengkap" aria-invalid={!!errors.name} />
              {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy">No. WhatsApp</span>
              <input className={inputClass} value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="0812xxxxxxx" aria-invalid={!!errors.phone} />
              {errors.phone && <span className="mt-1 block text-xs text-rose-600">{errors.phone}</span>}
            </label>
          </div>

          <p className="mb-2 mt-6 text-sm font-semibold text-navy">Metode</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "delivery", label: "Diantar", sub: "Kurir ke alamat Anda", icon: Truck },
              { value: "pickup", label: "Ambil di TPI", sub: "Lapak Blok A 67–70", icon: Store },
            ].map(({ value, label, sub, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, method: value as "delivery" | "pickup" }))}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl p-4 text-left ring-1 transition",
                  form.method === value ? "bg-brand-50 ring-2 ring-brand-500" : "bg-white ring-slate-200 hover:ring-brand-300",
                )}
              >
                <Icon className={cn("size-6 shrink-0", form.method === value ? "text-brand-600" : "text-slate-400")} />
                <span>
                  <span className="block font-bold text-navy">{label}</span>
                  <span className="block text-xs text-slate-500">{sub}</span>
                </span>
              </button>
            ))}
          </div>

          {form.method === "delivery" ? (
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-navy">Area pengiriman</span>
                <select className={cn(inputClass, "cursor-pointer")} value={form.areaId} onChange={set("areaId")} aria-invalid={!!errors.areaId}>
                  <option value="">Pilih area…</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — ongkir {formatRupiah(a.fee)}
                    </option>
                  ))}
                </select>
                {errors.areaId && <span className="mt-1 block text-xs text-rose-600">{errors.areaId}</span>}
                {area?.eta && <span className="mt-1 block text-xs text-slate-500">Estimasi: {area.eta}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-navy">Alamat lengkap</span>
                <textarea
                  className={cn(inputClass, "h-24 py-3")}
                  value={form.address}
                  onChange={set("address")}
                  autoComplete="street-address"
                  placeholder="Jalan, nomor rumah, RT/RW, kelurahan, patokan"
                  aria-invalid={!!errors.address}
                />
                {errors.address && <span className="mt-1 block text-xs text-rose-600">{errors.address}</span>}
              </label>
            </div>
          ) : (
            <div className="mt-4 flex gap-3 rounded-2xl bg-ice p-4 text-sm text-slate-700">
              <MapPin className="size-5 shrink-0 text-brand-600" />
              <span>
                Ambil di <b>{settings.address}</b>. Buka {settings.hours.open}–{settings.hours.close} WIB.
              </span>
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy">{form.method === "delivery" ? "Tanggal kirim" : "Tanggal ambil"}</span>
              <input type="date" className={inputClass} value={form.date} min={todayJakarta()} onChange={set("date")} aria-invalid={!!errors.date} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy">Catatan (opsional)</span>
              <input className={inputClass} value={form.notes} onChange={set("notes")} placeholder="Contoh: es batu tambahan" />
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-brand-900/5 sm:p-6">
          <h2 className="text-lg font-extrabold text-navy">Ringkasan</h2>
          {settings.show_prices && form.method === "delivery" && (
            <FreeShippingBar subtotal={summary.subtotal} threshold={freeMin ?? null} className="mt-4" />
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal ({lines.length} item)</dt>
              <dd className="font-semibold text-navy">{formatRupiah(summary.subtotal)}</dd>
            </div>
            {summary.unpriced > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-600">Item tanya harga</dt>
                <dd className="font-semibold text-brand-700">{summary.unpriced} item dikonfirmasi</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-600">Ongkir</dt>
              <dd className="font-semibold text-navy">
                {form.method === "pickup" ? "Gratis (ambil sendiri)" : shipping == null ? "Pilih area" : shipping === 0 ? <span className="text-emerald-600">GRATIS</span> : formatRupiah(shipping)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <dt className="font-bold text-navy">Estimasi total</dt>
              <dd className="text-2xl font-extrabold text-navy">{formatRupiah(summary.subtotal + (shipping ?? 0))}</dd>
            </div>
          </dl>
          {summary.unpriced > 0 && (
            <p className="mt-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
              Beberapa produk mengikuti harga lelang hari ini. Admin akan mengonfirmasi total akhir di WhatsApp.
            </p>
          )}
          {serverError && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /> {serverError}
            </p>
          )}
          <button type="submit" disabled={submitting} className={buttonClass("wa", "lg", "mt-5 w-full")}>
            {submitting ? <Loader2 className="size-5 animate-spin" /> : <WhatsAppIcon size={20} />}
            {submitting ? "Menyiapkan pesanan…" : "Kirim Pesanan via WhatsApp"}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            Pesanan akan tersusun otomatis di WhatsApp. Pembayaran dilakukan setelah admin mengonfirmasi.
          </p>
        </div>
      </aside>
    </form>
  );
}

"use client";

import { formatKg, formatRupiah, type PlacedOrder } from "@sfs/shared";
import { CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@/lib/track";
import { LAST_ORDER_KEY } from "./checkout";
import { WhatsAppIcon } from "./icons";
import { buttonClass } from "./ui";

interface LastOrder {
  order: PlacedOrder;
  message: string;
  waUrl: string;
  createdAt: number;
}

export function OrderSent() {
  const [data, setData] = useState<LastOrder | null | undefined>(undefined);
  const [seconds, setSeconds] = useState(3);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      setData(raw ? JSON.parse(raw) : null);
    } catch {
      setData(null);
    }
  }, []);

  const fresh = data && Date.now() - data.createdAt < 60_000;

  useEffect(() => {
    if (!data || !fresh) return;
    if (seconds <= 0) {
      track("wa_click", null, { from: "checkout", order: data.order.order_code });
      window.location.href = data.waUrl;
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [data, fresh, seconds]);

  if (data === undefined) return <div className="mx-auto h-96 max-w-xl animate-pulse rounded-3xl bg-white" />;

  if (!data) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold text-navy">Belum ada pesanan</h1>
        <Link href="/produk" className={buttonClass("coral", "lg", "mt-6")}>Belanja Sekarang</Link>
      </div>
    );
  }

  const { order } = data;
  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-3xl bg-white p-6 text-center shadow-xl shadow-brand-900/5 sm:p-10">
        <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-extrabold text-navy sm:text-3xl">Pesanan tercatat!</h1>
        <p className="mt-2 text-slate-600">
          Nomor pesanan <b className="text-navy">{order.order_code}</b>. Langkah terakhir: kirim pesan di WhatsApp agar admin segera memproses.
        </p>
        <a
          href={data.waUrl}
          onClick={() => track("wa_click", null, { from: "checkout", order: order.order_code })}
          className={buttonClass("wa", "lg", "mt-6 w-full")}
        >
          <WhatsAppIcon size={20} /> Buka WhatsApp {fresh && seconds > 0 ? `(${seconds})` : ""}
        </a>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(data.message);
            setCopied(true);
          }}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand-600"
        >
          <Copy className="size-4" /> {copied ? "Pesan tersalin ✓" : "Salin teks pesanan"}
        </button>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-bold text-navy">Ringkasan</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 py-2.5">
              <span>
                <span className="font-semibold text-navy">{item.name}</span>
                <span className="block text-xs text-slate-500">
                  {item.kind === "bundle" ? `${item.qty} paket` : formatKg(item.qty)}
                  {item.processing ? ` · ${item.processing}` : ""}
                </span>
              </span>
              <span className="shrink-0 font-semibold text-navy">{item.line_total != null ? formatRupiah(item.line_total) : "Dikonfirmasi"}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Ongkir</dt>
            <dd>{order.shipping_fee ? formatRupiah(order.shipping_fee) : order.area_name ? "GRATIS" : "-"}</dd>
          </div>
          <div className="flex justify-between text-base font-extrabold text-navy">
            <dt>Estimasi total</dt>
            <dd>{formatRupiah(order.total)}{order.has_unpriced ? " + konfirmasi" : ""}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/produk" className="font-semibold text-brand-600">← Lanjut belanja</Link>
      </p>
    </div>
  );
}

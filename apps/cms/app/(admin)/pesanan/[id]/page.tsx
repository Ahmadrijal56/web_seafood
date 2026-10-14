import { formatDateLong, formatDateTime, formatKg, formatRupiah, mergeSettings, ORDER_STATUS_LABELS, type OrderWithItems } from "@sfs/shared";
import { CalendarDays, MapPin, Phone, StickyNote, Store } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, PageHeader, Pill } from "@/components/ui";
import { STATUS_TONES } from "@/lib/orders";
import { requireAdmin } from "@/lib/supabase/server";
import { OrderActions } from "./order-actions";

export const metadata: Metadata = { title: "Detail Pesanan" };

export default async function OrderDetailPage({ params }: PageProps<"/pesanan/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data }, { data: settingsRows }] = await Promise.all([
    supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle(),
    supabase.from("settings").select("key, value").eq("key", "store_name"),
  ]);
  if (!data) notFound();
  const order = data as OrderWithItems;
  const storeName = mergeSettings(settingsRows).store_name;

  return (
    <div>
      <PageHeader
        back={{ href: "/pesanan", label: "Semua pesanan" }}
        title={order.order_code}
        description={`Masuk ${formatDateTime(order.created_at)} · via ${order.source === "web" ? "website" : order.source}`}
        actions={<Pill tone={STATUS_TONES[order.status]} className="px-3 py-1 text-xs">{ORDER_STATUS_LABELS[order.status]}</Pill>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="min-w-0 space-y-6 lg:col-span-3">
          <Card title={`Item pesanan (${order.order_items.length})`}>
            <ul className="divide-y divide-slate-100">
              {order.order_items.map((it) => (
                <li key={it.id} className="flex gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-navy">{it.name_snapshot}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {it.bundle_id ? `${it.qty_kg} paket` : formatKg(it.qty_kg)}
                      {it.processing && ` · ${it.processing}`}
                      {it.unit_price != null && ` · ${formatRupiah(it.unit_price)}${it.bundle_id ? "/paket" : "/kg"}`}
                      {it.extra_price > 0 && ` + olahan ${formatRupiah(it.extra_price)}/kg`}
                    </p>
                    {it.notes && <p className="mt-1 text-xs italic text-slate-500">“{it.notes}”</p>}
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {it.line_total == null ? <Pill tone="rose">Tanya harga</Pill> : formatRupiah(it.line_total)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-dashed border-slate-200 pt-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <dt>Subtotal</dt>
                <dd>{formatRupiah(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-500">
                <dt>Ongkir</dt>
                <dd>{order.method === "pickup" ? "—" : order.shipping_fee ? formatRupiah(order.shipping_fee) : "GRATIS"}</dd>
              </div>
              <div className="flex justify-between pt-1 text-base font-extrabold text-navy">
                <dt>Total</dt>
                <dd>{formatRupiah(order.total)}</dd>
              </div>
              {order.has_unpriced && <p className="text-xs text-rose-600">+ ada item yang harganya perlu dikonfirmasi ke pelanggan</p>}
            </dl>
          </Card>

          <Card title="Pelanggan & pengiriman">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <Info icon={<Phone className="size-4" />} label="Nama / WhatsApp" value={`${order.customer_name} · ${order.customer_phone}`} />
              <Info
                icon={order.method === "delivery" ? <MapPin className="size-4" /> : <Store className="size-4" />}
                label={order.method === "delivery" ? `Diantar — ${order.area_name ?? "-"}` : "Ambil sendiri"}
                value={order.method === "delivery" ? (order.address ?? "-") : "Lapak TPI Muara Angke Blok A No. 67–70"}
              />
              <Info icon={<CalendarDays className="size-4" />} label="Tanggal kirim / ambil" value={order.delivery_date ? formatDateLong(order.delivery_date) : "-"} />
              <Info icon={<StickyNote className="size-4" />} label="Catatan" value={order.notes || "-"} />
            </dl>
          </Card>
        </div>

        <div className="min-w-0 lg:col-span-2">
          <OrderActions order={order} storeName={storeName} />
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-bold text-slate-400">{label}</dt>
        <dd className="mt-0.5 whitespace-pre-line break-words font-semibold text-slate-700">{value}</dd>
      </div>
    </div>
  );
}

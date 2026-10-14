import { formatDateLong, formatDateTime, formatRupiah, ORDER_STATUS_LABELS, type OrderStatus, type OrderWithItems } from "@sfs/shared";
import { ClipboardList, MapPin, Search, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader, Pill } from "@/components/ui";
import { STATUS_FLOW, STATUS_TONES } from "@/lib/orders";
import { requireAdmin } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ExportButton } from "./export-button";

export const metadata: Metadata = { title: "Pesanan" };

const RANGES = [
  { id: "today", label: "Hari ini", days: 1 },
  { id: "7d", label: "7 hari", days: 7 },
  { id: "30d", label: "30 hari", days: 30 },
  { id: "all", label: "Semua", days: 0 },
];

export default async function OrdersPage({ searchParams }: PageProps<"/pesanan">) {
  const params = await searchParams;
  const status = STATUS_FLOW.includes(params.status as OrderStatus) ? (params.status as OrderStatus) : null;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const range = RANGES.find((r) => r.id === params.range) ?? RANGES[3];
  const { supabase } = await requireAdmin();

  let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(300);
  if (status) query = query.eq("status", status);
  const term = q.replace(/[,()*%\\]/g, " ").trim();
  if (term) query = query.or(`order_code.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`);
  if (range.days) {
    const start = new Date(`${new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)}T00:00:00+07:00`);
    start.setDate(start.getDate() - (range.days - 1));
    query = query.gte("created_at", start.toISOString());
  }
  const [{ data }, { data: counts }] = await Promise.all([query, supabase.from("orders").select("status")]);
  const orders = (data ?? []) as OrderWithItems[];
  const countBy = (s: OrderStatus) => (counts ?? []).filter((c) => c.status === s).length;

  const href = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams();
    const merged = { status, q: q || null, range: range.id === "all" ? null : range.id, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/pesanan?${s}` : "/pesanan";
  };

  return (
    <div>
      <PageHeader
        title="Pesanan"
        description="Pesanan dari checkout website. Ubah status & balas pelanggan langsung via WhatsApp."
        actions={<ExportButton orders={orders} />}
      />

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Link href={href({ status: null })} className={tabClass(!status)}>
          Semua <span className="opacity-60">{counts?.length ?? 0}</span>
        </Link>
        {STATUS_FLOW.map((s) => (
          <Link key={s} href={href({ status: s })} className={tabClass(status === s)}>
            {ORDER_STATUS_LABELS[s]} <span className="opacity-60">{countBy(s)}</span>
          </Link>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <form className="relative flex-1" action="/pesanan">
          {status && <input type="hidden" name="status" value={status} />}
          {range.id !== "all" && <input type="hidden" name="range" value={range.id} />}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Cari kode, nama, atau no. WA…" className="input pl-10" />
        </form>
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <Link
              key={r.id}
              href={href({ range: r.id === "all" ? null : r.id })}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-bold", range.id === r.id ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50")}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<ClipboardList className="size-7" />} title="Tidak ada pesanan" text="Coba ubah filter atau kata kunci pencarian." />
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/pesanan/${o.id}`} className="card block p-4 transition hover:border-brand-200 hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-navy">{o.customer_name}</span>
                      <Pill tone={STATUS_TONES[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Pill>
                      {o.has_unpriced && <Pill tone="rose">Ada item tanya harga</Pill>}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      <span className="font-mono font-semibold text-slate-500">{o.order_code}</span> · {formatDateTime(o.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-navy">{formatRupiah(o.total)}</p>
                    <p className="text-[11px] text-slate-400">{o.order_items.length} item</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-1 text-sm text-slate-600">{o.order_items.map((it) => it.name_snapshot).join(", ")}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    {o.method === "delivery" ? <MapPin className="size-3.5" /> : <Store className="size-3.5" />}
                    {o.method === "delivery" ? (o.area_name ?? "Diantar") : "Ambil di TPI"}
                  </span>
                  {o.delivery_date && <span>Tanggal: {formatDateLong(o.delivery_date)}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function tabClass(active: boolean) {
  return cn(
    "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
    active ? "border-navy bg-navy text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
  );
}

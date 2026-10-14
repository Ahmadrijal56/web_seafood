import { formatDateTime, formatRupiah, formatRupiahShort, ORDER_STATUS_LABELS, STOCK_LABELS, type Order, type Product } from "@sfs/shared";
import { AlertTriangle, ArrowRight, ClipboardList, MousePointerClick, Plus, ShoppingCart, Tags, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { ButtonLink, Card, Pill } from "@/components/ui";
import { STATUS_TONES } from "@/lib/orders";
import { requireAdmin } from "@/lib/supabase/server";

type Stats = {
  orders_today: number;
  orders_week: number;
  revenue_week: number;
  orders_new: number;
  wa_clicks_week: number;
  add_to_cart_week: number;
  top_products: { name: string; qty_kg: number; orders: number }[];
  daily: { day: string; orders: number }[];
};

export default async function DashboardPage() {
  const { supabase, name } = await requireAdmin();
  const [{ data: stats }, { data: orders }, { data: lowStock }] = await Promise.all([
    supabase.rpc("dashboard_stats"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select("id, name, stock_status").eq("is_active", true).neq("stock_status", "available").order("name"),
  ]);
  const s = stats as Stats;
  const latest = (orders ?? []) as Order[];
  const alerts = (lowStock ?? []) as Pick<Product, "id" | "name" | "stock_status">[];
  const maxDaily = Math.max(1, ...s.daily.map((d) => d.orders));
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(new Date()));
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  const cards = [
    { label: "Pesanan baru", value: s.orders_new, hint: "perlu diproses", icon: ClipboardList, tone: "bg-coral/10 text-coral", href: "/pesanan?status=new" },
    { label: "Pesanan hari ini", value: s.orders_today, hint: `${s.orders_week} dalam 7 hari`, icon: TrendingUp, tone: "bg-brand-50 text-brand-600" },
    { label: "Omzet 7 hari", value: formatRupiahShort(s.revenue_week), hint: "estimasi, tanpa batal", icon: Wallet, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Klik WhatsApp", value: s.wa_clicks_week, hint: `${s.add_to_cart_week} tambah keranjang`, icon: MousePointerClick, tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{greeting}{name ? `, ${name}` : ""} 👋</p>
          <h1 className="text-xl font-extrabold text-navy sm:text-2xl">Ringkasan toko</h1>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/harga" variant="coral">
            <Tags className="size-4" /> Update Harga Hari Ini
          </ButtonLink>
          <ButtonLink href="/produk/baru" variant="outline" className="hidden sm:inline-flex">
            <Plus className="size-4" /> Produk
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => {
          const body = (
            <>
              <div className={`grid size-10 place-items-center rounded-xl ${c.tone}`}>
                <c.icon className="size-5" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-navy">{c.value}</p>
              <p className="text-xs font-bold text-slate-600">{c.label}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{c.hint}</p>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="card p-4 transition hover:border-brand-200 hover:shadow-md">
              {body}
            </Link>
          ) : (
            <div key={c.label} className="card p-4">
              {body}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          title="Pesanan terbaru"
          className="lg:col-span-3"
          actions={
            <Link href="/pesanan" className="flex items-center gap-1 text-xs font-bold text-brand-600">
              Semua <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {latest.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Belum ada pesanan.</p>
          ) : (
            <ul className="-mx-2 divide-y divide-slate-100">
              {latest.map((o) => (
                <li key={o.id}>
                  <Link href={`/pesanan/${o.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-bold text-navy">
                        <span className="truncate">{o.customer_name}</span>
                        <Pill tone={STATUS_TONES[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Pill>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {o.order_code} · {formatDateTime(o.created_at)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-700">{formatRupiah(o.total)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card title="Pesanan 7 hari terakhir">
            <div className="flex h-36 items-end gap-2">
              {s.daily.map((d) => {
                const date = new Date(`${d.day}T00:00:00+07:00`);
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500">{d.orders}</span>
                    <div className="w-full rounded-lg bg-gradient-to-t from-brand-600 to-brand-400" style={{ height: `${Math.max(4, (d.orders / maxDaily) * 96)}px` }} />
                    <span className="text-[10px] font-semibold text-slate-400">
                      {date.toLocaleDateString("id-ID", { weekday: "short", timeZone: "Asia/Jakarta" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Produk terlaris (30 hari)">
            {s.top_products.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada data.</p>
            ) : (
              <ol className="space-y-2.5">
                {s.top_products.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-extrabold text-brand-700">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{p.name}</span>
                    <span className="text-xs text-slate-400">{p.orders}× order</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {alerts.length > 0 && (
            <Card title="Stok perlu dicek">
              <ul className="space-y-2">
                {alerts.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className={p.stock_status === "out" ? "size-4 text-rose-500" : "size-4 text-amber-500"} />
                    <Link href={`/produk/${p.id}`} className="flex-1 truncate font-semibold text-slate-700 hover:text-brand-600">
                      {p.name}
                    </Link>
                    <Pill tone={p.stock_status === "out" ? "rose" : "amber"}>{STOCK_LABELS[p.stock_status]}</Pill>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <div className="card flex flex-col items-start gap-4 bg-gradient-to-r from-navy to-brand-700 p-5 text-white sm:flex-row sm:items-center">
        <ShoppingCart className="hidden size-8 text-brand-200 sm:block" />
        <div className="flex-1">
          <p className="font-bold">Tips: update harga setiap pagi setelah lelang</p>
          <p className="text-sm text-brand-100/80">Pelanggan lebih percaya kalau tanggal &quot;Harga Hari Ini&quot; selalu terbaru. Cukup 1 menit dari HP.</p>
        </div>
        <ButtonLink href="/harga" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
          Buka Update Harga
        </ButtonLink>
      </div>
    </div>
  );
}

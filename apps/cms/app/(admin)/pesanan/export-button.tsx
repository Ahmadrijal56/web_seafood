"use client";

import { ORDER_STATUS_LABELS, type OrderWithItems } from "@sfs/shared";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";

export function ExportButton({ orders }: { orders: OrderWithItems[] }) {
  const [busy, setBusy] = useState(false);

  async function exportXlsx() {
    setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const fmtDate = (iso: string) => new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
      const summary = orders.map((o) => ({
        "Kode": o.order_code,
        "Tanggal Order": fmtDate(o.created_at),
        "Status": ORDER_STATUS_LABELS[o.status],
        "Nama": o.customer_name,
        "No. WA": o.customer_phone,
        "Metode": o.method === "delivery" ? "Diantar" : "Ambil di TPI",
        "Area": o.area_name ?? "",
        "Alamat": o.address ?? "",
        "Tanggal Kirim": o.delivery_date ?? "",
        "Subtotal": o.subtotal,
        "Ongkir": o.shipping_fee,
        "Total": o.total,
        "Ada Item Tanya Harga": o.has_unpriced ? "Ya" : "",
        "Catatan": o.notes ?? "",
        "Produk": o.order_items.map((it) => `${it.name_snapshot} (${it.qty_kg})`).join("; "),
      }));
      const items = orders.flatMap((o) =>
        o.order_items.map((it) => ({
          "Kode": o.order_code,
          "Tanggal Order": fmtDate(o.created_at),
          "Pelanggan": o.customer_name,
          "Produk": it.name_snapshot,
          "Jenis": it.bundle_id ? "Paket" : "Produk",
          "Qty (kg/paket)": Number(it.qty_kg),
          "Olahan": it.processing ?? "",
          "Harga Satuan": it.unit_price ?? "",
          "Biaya Olahan/kg": it.extra_price,
          "Total Baris": it.line_total ?? "",
          "Catatan": it.notes ?? "",
        })),
      );
      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(summary);
      ws1["!cols"] = [12, 18, 12, 20, 15, 12, 16, 36, 12, 12, 10, 12, 10, 24, 50].map((wch) => ({ wch }));
      XLSX.utils.book_append_sheet(wb, ws1, "Pesanan");
      const ws2 = XLSX.utils.json_to_sheet(items);
      ws2["!cols"] = [16, 18, 20, 30, 8, 12, 18, 12, 12, 12, 24].map((wch) => ({ wch }));
      XLSX.utils.book_append_sheet(wb, ws2, "Detail Item");
      const stamp = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
      XLSX.writeFile(wb, `pesanan-syauqi-${stamp}.xlsx`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={exportXlsx} loading={busy} disabled={orders.length === 0}>
      {!busy && <FileSpreadsheet className="size-4 text-emerald-600" />} Export Excel
    </Button>
  );
}

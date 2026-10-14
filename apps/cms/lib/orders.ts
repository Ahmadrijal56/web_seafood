import { formatDateLong, formatKg, formatRupiah, type OrderStatus, type OrderWithItems } from "@sfs/shared";
import type { Tone } from "@/components/ui";

export const STATUS_FLOW: OrderStatus[] = ["new", "confirmed", "shipped", "done", "cancelled"];

export const STATUS_TONES: Record<OrderStatus, Tone> = {
  new: "amber",
  confirmed: "brand",
  shipped: "violet",
  done: "green",
  cancelled: "slate",
};

function itemLines(order: OrderWithItems) {
  return order.order_items
    .map((it) => {
      const qty = it.bundle_id ? `${it.qty_kg} paket` : formatKg(it.qty_kg);
      const price = it.line_total == null ? "harga dikonfirmasi" : formatRupiah(it.line_total);
      return `• ${it.name_snapshot} — ${qty}${it.processing ? ` (${it.processing})` : ""} — ${price}`;
    })
    .join("\n");
}

export type ReplyTemplate = { id: string; label: string; build: (order: OrderWithItems, store: string) => string };

export const REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    id: "confirm",
    label: "Konfirmasi pesanan",
    build: (o, store) =>
      [
        `Halo Kak ${o.customer_name} 👋`,
        `Terima kasih sudah order di ${store}. Pesanan *${o.order_code}* sudah kami terima dan stok tersedia.`,
        "",
        itemLines(o),
        "",
        `Ongkir: ${o.shipping_fee ? formatRupiah(o.shipping_fee) : "GRATIS"}`,
        `Total: *${formatRupiah(o.total)}*${o.has_unpriced ? " + item yang harganya kami konfirmasi" : ""}`,
        o.method === "delivery" ? `Dikirim: ${o.delivery_date ? formatDateLong(o.delivery_date) : "-"}` : "Diambil di lapak TPI Muara Angke",
        "",
        "Untuk pembayaran, kami kirimkan nomor rekening setelah Kakak setuju ya. Terima kasih 🙏",
      ].join("\n"),
  },
  {
    id: "price",
    label: "Info harga hari ini",
    build: (o) =>
      [
        `Halo Kak ${o.customer_name}, untuk pesanan *${o.order_code}* harga lelang hari ini:`,
        "",
        itemLines(o),
        "",
        "Apakah mau dilanjutkan Kak? 🙏",
      ].join("\n"),
  },
  {
    id: "shipped",
    label: "Pesanan dikirim",
    build: (o) =>
      `Halo Kak ${o.customer_name}, pesanan *${o.order_code}* sedang dalam perjalanan 🚚\nSeafood sudah dikemas dengan es agar tetap segar sampai tujuan. Mohon ditunggu ya Kak 🙏`,
  },
  {
    id: "done",
    label: "Terima kasih & minta ulasan",
    build: (o, store) =>
      `Terima kasih Kak ${o.customer_name} sudah belanja di ${store} 🐟\nSemoga seafood-nya memuaskan. Boleh minta ulasan singkat atau foto masakannya Kak? Sangat membantu kami 🙏`,
  },
  {
    id: "out",
    label: "Stok habis / ganti produk",
    build: (o) =>
      `Halo Kak ${o.customer_name}, mohon maaf untuk pesanan *${o.order_code}* ada item yang stoknya sedang habis di lelang hari ini 🙏\nBoleh kami tawarkan pengganti dengan kualitas setara?`,
  },
];

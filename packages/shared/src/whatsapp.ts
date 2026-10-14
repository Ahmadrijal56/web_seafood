import { formatDateLong, formatKg, formatRupiah } from "./format";
import type { DeliveryMethod, PlacedOrder } from "./types";

export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export interface OrderMessageInput {
  order: PlacedOrder;
  customerName: string;
  customerPhone: string;
  method: DeliveryMethod;
  address?: string | null;
  deliveryDate?: string | null;
  notes?: string | null;
  storeName?: string;
}

function qtyLabel(item: PlacedOrder["items"][number]): string {
  return item.kind === "bundle" ? `${item.qty} paket` : formatKg(item.qty);
}

export function buildOrderMessage(input: OrderMessageInput): string {
  const { order } = input;
  const lines: string[] = [];
  lines.push(`Halo ${input.storeName ?? "Syauqi Fresh Seafood"}, saya mau order 🐟`);
  lines.push(`No. Pesanan: ${order.order_code}`);
  lines.push("");

  order.items.forEach((item, index) => {
    const parts = [item.name, qtyLabel(item)];
    if (item.processing) parts.push(item.processing.toLowerCase());
    lines.push(`${index + 1}. ${parts.join(" — ")}`);
    if (item.unit_price != null && item.line_total != null) {
      if (item.kind === "bundle") {
        lines.push(`   ${formatRupiah(item.unit_price)}/paket = ${formatRupiah(item.line_total)}`);
      } else {
        const unit = item.unit_price + (item.extra_price ?? 0);
        lines.push(`   ${formatRupiah(unit)}/kg = ${formatRupiah(item.line_total)}`);
      }
    } else {
      lines.push("   Harga mohon dikonfirmasi");
    }
    if (item.notes) lines.push(`   Catatan: ${item.notes}`);
  });

  lines.push("");
  const priced = order.subtotal > 0;
  if (priced) {
    let total = `Estimasi total: ${formatRupiah(order.subtotal)}`;
    if (order.has_unpriced) total += " + item konfirmasi";
    if (input.method === "delivery") {
      if (order.area_name) {
        total += order.shipping_fee > 0 ? ` + ongkir ${formatRupiah(order.shipping_fee)}` : " (GRATIS ONGKIR)";
      } else {
        total += " (belum ongkir)";
      }
    }
    lines.push(total);
  } else {
    lines.push("Total: mohon dikonfirmasi admin");
  }

  lines.push("");
  lines.push(`Nama: ${input.customerName}`);
  lines.push(`No. WA: ${input.customerPhone}`);
  if (input.method === "delivery") {
    const area = order.area_name ? ` (${order.area_name})` : "";
    lines.push(`Pengiriman: Diantar — ${input.address ?? "-"}${area}`);
  } else {
    lines.push("Pengiriman: Ambil di TPI Muara Angke");
  }
  if (input.deliveryDate) lines.push(`Tanggal: ${formatDateLong(input.deliveryDate)}`);
  if (input.notes) lines.push(`Catatan: ${input.notes}`);
  return lines.join("\n");
}

export function buildProductInquiry(product: { name: string; size_label?: string | null }, qtyKg?: number, processing?: string | null): string {
  const name = product.size_label ? `${product.name} (${product.size_label})` : product.name;
  const parts = [`Halo Syauqi Fresh Seafood, saya mau pesan *${name}*`];
  if (qtyKg) parts.push(`sebanyak ${formatKg(qtyKg)}`);
  if (processing) parts.push(`(${processing.toLowerCase()})`);
  return `${parts.join(" ")}. Apakah stok tersedia hari ini? 🙏`;
}

export interface QuoteRequestInput {
  businessName: string;
  contactName: string;
  phone: string;
  businessType: string;
  city: string;
  products: string;
  volume: string;
  frequency: string;
  notes?: string;
}

export function buildQuoteMessage(input: QuoteRequestInput): string {
  return [
    "Halo Syauqi Fresh Seafood, saya ingin minta *penawaran supply* 🤝",
    "",
    `Nama usaha: ${input.businessName}`,
    `Jenis usaha: ${input.businessType}`,
    `Kontak: ${input.contactName} (${input.phone})`,
    `Kota: ${input.city}`,
    `Produk: ${input.products}`,
    `Volume: ${input.volume}`,
    `Frekuensi: ${input.frequency}`,
    input.notes ? `Catatan: ${input.notes}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

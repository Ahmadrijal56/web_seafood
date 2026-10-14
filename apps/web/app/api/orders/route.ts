import { buildOrderMessage, isValidPhone, waLink, type PlacedOrder } from "@sfs/shared";
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";
import { supabaseLive } from "@/lib/supabase";

interface OrderRequest {
  customer_name: string;
  customer_phone: string;
  method: "delivery" | "pickup";
  address?: string;
  area_id?: string;
  delivery_date?: string;
  notes?: string;
  items: { kind: "product" | "bundle"; id: string; qty: number; processing_id?: string | null; notes?: string }[];
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: OrderRequest;
  try {
    body = await request.json();
  } catch {
    return bad("Format data tidak valid");
  }

  const name = body.customer_name?.trim();
  const phone = body.customer_phone?.trim();
  if (!name) return bad("Nama wajib diisi");
  if (!phone || !isValidPhone(phone)) return bad("Nomor WhatsApp tidak valid");
  if (body.method !== "delivery" && body.method !== "pickup") return bad("Pilih metode pengiriman");
  if (body.method === "delivery" && !body.address?.trim()) return bad("Alamat pengiriman wajib diisi");
  if (!Array.isArray(body.items) || body.items.length === 0) return bad("Keranjang kosong");

  const payload = {
    customer_name: name,
    customer_phone: phone,
    method: body.method,
    address: body.method === "delivery" ? body.address?.trim() : null,
    area_id: body.method === "delivery" ? body.area_id || null : null,
    delivery_date: body.delivery_date || null,
    notes: body.notes?.trim() || null,
    items: body.items.map((item) =>
      item.kind === "bundle"
        ? { bundle_id: item.id, qty: item.qty, notes: item.notes || null }
        : { product_id: item.id, qty_kg: item.qty, processing_option_id: item.processing_id || null, notes: item.notes || null },
    ),
  };

  const { data, error } = await supabaseLive.rpc("place_order", { payload });
  if (error) {
    return bad(error.message || "Gagal menyimpan pesanan", 422);
  }

  const order = data as PlacedOrder;
  const settings = await getSettings();
  const message = buildOrderMessage({
    order,
    customerName: name,
    customerPhone: phone,
    method: body.method,
    address: payload.address,
    deliveryDate: payload.delivery_date,
    notes: payload.notes,
    storeName: settings.store_name,
  });

  return NextResponse.json({ order, message, waUrl: waLink(settings.whatsapp, message) });
}

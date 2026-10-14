"use client";

type EventType = "wa_click" | "add_to_cart" | "quote_request";

type PixelWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (event: string, data?: object) => void };
};

const PIXEL_EVENTS: Record<EventType, { ga: string; meta: string; tiktok: string }> = {
  wa_click: { ga: "generate_lead", meta: "Contact", tiktok: "Contact" },
  add_to_cart: { ga: "add_to_cart", meta: "AddToCart", tiktok: "AddToCart" },
  quote_request: { ga: "generate_lead", meta: "Lead", tiktok: "SubmitForm" },
};

/** Catat event ringan ke Supabase (tanpa menunggu respons) + teruskan ke pixel iklan bila aktif. */
export function track(type: EventType, productId?: string | null, meta?: Record<string, unknown>) {
  const w = window as PixelWindow;
  const pixel = PIXEL_EVENTS[type];
  w.gtag?.("event", pixel.ga, { event_category: type, ...meta });
  w.fbq?.("track", pixel.meta);
  w.ttq?.track(pixel.tiktok);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  fetch(`${url}/rest/v1/events`, {
    method: "POST",
    keepalive: true,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ type, product_id: productId ?? null, meta: meta ?? null }),
  }).catch(() => {});
}

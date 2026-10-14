"use client";

import {
  formatDateTime,
  formatRupiah,
  videoThumbnail,
  type Banner,
  type Category,
  type Faq,
  type ShippingArea,
  type Testimonial,
  type Video,
} from "@sfs/shared";
import { CircleHelp, Clapperboard, ImageIcon, LayoutGrid, Megaphone, MessageSquareQuote, Star, Truck } from "lucide-react";
import { CollectionManager, type Row } from "./collection";
import { Pill } from "./ui";

const asRows = <T,>(items: T[]) => items as unknown as Row[];

function Thumb({ src, className = "size-14" }: { src: string | null | undefined; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${className} shrink-0 rounded-xl object-cover`} />
  ) : (
    <div className={`${className} grid shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-300`}>
      <ImageIcon className="size-5" />
    </div>
  );
}

const CATEGORY_ICONS = [
  { value: "fish", label: "Ikan" },
  { value: "shrimp", label: "Udang" },
  { value: "crab", label: "Kepiting" },
  { value: "squid", label: "Cumi" },
  { value: "shell", label: "Kerang" },
];

export function CategoryManager({ items, counts }: { items: Category[]; counts: Record<string, number> }) {
  return (
    <CollectionManager
      table="categories"
      noun="kategori"
      folder="categories"
      icon={<LayoutGrid className="size-7" />}
      items={asRows(items)}
      defaults={{ icon: "fish" }}
      fields={[
        { key: "name", label: "Nama kategori", type: "text", required: true, placeholder: "Ikan Laut" },
        { key: "slug", label: "Slug", type: "slug", from: "name", hint: "Dipakai di filter katalog" },
        { key: "icon", label: "Ikon", type: "select", options: CATEGORY_ICONS },
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "image_url", label: "Foto kategori", type: "image", aspect: "aspect-square", hint: "Opsional — jika kosong memakai foto produk pertama" },
      ]}
      renderItem={(item) => {
        const c = item as unknown as Category;
        return (
          <div className="flex items-center gap-3">
            <Thumb src={c.image_url} />
            <div className="min-w-0">
              <p className="font-bold text-navy">{c.name}</p>
              <p className="truncate text-xs text-slate-400">
                /{c.slug} · {counts[c.id] ?? 0} produk
              </p>
            </div>
          </div>
        );
      }}
    />
  );
}

function bannerState(b: Banner): { label: string; tone: "green" | "amber" | "slate" } {
  const now = Date.now();
  if (b.starts_at && new Date(b.starts_at).getTime() > now) return { label: "Terjadwal", tone: "amber" };
  if (b.ends_at && new Date(b.ends_at).getTime() < now) return { label: "Berakhir", tone: "slate" };
  return { label: "Berjalan", tone: "green" };
}

export function BannerManager({ items }: { items: Banner[] }) {
  return (
    <CollectionManager
      table="banners"
      noun="banner"
      folder="banners"
      icon={<Megaphone className="size-7" />}
      emptyText="Banner tampil sebagai slider promo di beranda."
      items={asRows(items)}
      defaults={{ show_countdown: false, cta_label: "Pesan Sekarang", link: "/produk" }}
      validate={(v) => (v.starts_at && v.ends_at && String(v.ends_at) <= String(v.starts_at) ? "Waktu selesai harus setelah waktu mulai" : null)}
      fields={[
        { key: "image_url", label: "Gambar banner", type: "image", aspect: "aspect-[16/9]", hint: "Rasio lebar 16:9, foto produk yang terang terlihat paling menarik" },
        { key: "title", label: "Judul", type: "text", required: true, full: true, placeholder: "Promo Kerang Hijau Rp 35rb/kg" },
        { key: "subtitle", label: "Sub judul", type: "textarea", placeholder: "Khusus pembelian minggu ini…" },
        { key: "cta_label", label: "Teks tombol", type: "text" },
        { key: "link", label: "Link tombol", type: "text", hint: "Contoh: /produk/kerang-hijau atau /paket" },
        { key: "starts_at", label: "Mulai tampil", type: "datetime", hint: "Kosongkan = langsung tampil" },
        { key: "ends_at", label: "Berakhir", type: "datetime", hint: "Kosongkan = tanpa batas" },
        { key: "show_countdown", label: "Tampilkan hitung mundur", type: "toggle", full: true, hint: "Butuh waktu berakhir — membuat promo terasa mendesak" },
      ]}
      renderItem={(item) => {
        const b = item as unknown as Banner;
        const state = bannerState(b);
        return (
          <div className="flex items-center gap-3">
            <Thumb src={b.image_url} className="h-11 w-[4.5rem] sm:h-14 sm:w-24" />
            <div className="min-w-0">
              <p className="truncate font-bold text-navy">{b.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <Pill tone={state.tone}>{state.label}</Pill>
                {b.show_countdown && <Pill tone="rose">Countdown</Pill>}
                {b.ends_at && <span>s/d {formatDateTime(b.ends_at)}</span>}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

export function TestimonialManager({ items }: { items: Testimonial[] }) {
  return (
    <CollectionManager
      table="testimonials"
      noun="testimoni"
      folder="testimonials"
      icon={<MessageSquareQuote className="size-7" />}
      items={asRows(items)}
      defaults={{ rating: 5 }}
      fields={[
        { key: "name", label: "Nama", type: "text", required: true, placeholder: "Ibu Rina" },
        { key: "city", label: "Kota / keterangan", type: "text", placeholder: "Kelapa Gading" },
        { key: "rating", label: "Rating", type: "rating" },
        { key: "content", label: "Isi testimoni", type: "textarea", required: true },
        { key: "image_url", label: "Foto (opsional)", type: "image", aspect: "aspect-square", hint: "Screenshot chat atau foto pelanggan (dengan izin)" },
      ]}
      renderItem={(item) => {
        const t = item as unknown as Testimonial;
        return (
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-navy">{t.name}</p>
              <span className="flex">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                ))}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">“{t.content}”</p>
          </div>
        );
      }}
    />
  );
}

export function VideoManager({ items }: { items: Video[] }) {
  return (
    <CollectionManager
      table="videos"
      noun="video"
      folder="videos"
      icon={<Clapperboard className="size-7" />}
      emptyText="Tempel link YouTube/TikTok/Instagram — tampil di beranda & halaman Testimoni."
      items={asRows(items)}
      defaults={{ platform: "youtube" }}
      fields={[
        {
          key: "platform",
          label: "Platform",
          type: "select",
          options: [
            { value: "youtube", label: "YouTube" },
            { value: "tiktok", label: "TikTok" },
            { value: "instagram", label: "Instagram" },
          ],
        },
        { key: "title", label: "Judul", type: "text", placeholder: "Mukbang udang bakar" },
        { key: "url", label: "Link video", type: "text", required: true, full: true, placeholder: "https://youtube.com/shorts/…" },
        { key: "thumbnail_url", label: "Thumbnail (opsional)", type: "image", aspect: "aspect-video", hint: "YouTube otomatis memakai thumbnail asli" },
      ]}
      renderItem={(item) => {
        const v = item as unknown as Video;
        return (
          <div className="flex items-center gap-3">
            <Thumb src={videoThumbnail(v.platform, v.url, v.thumbnail_url)} className="h-11 w-[4.5rem] sm:h-14 sm:w-24" />
            <div className="min-w-0">
              <p className="truncate font-bold text-navy">{v.title ?? v.url}</p>
              <p className="truncate text-xs capitalize text-slate-400">{v.platform}</p>
            </div>
          </div>
        );
      }}
    />
  );
}

export function FaqManager({ items }: { items: Faq[] }) {
  return (
    <CollectionManager
      table="faqs"
      noun="FAQ"
      icon={<CircleHelp className="size-7" />}
      items={asRows(items)}
      defaults={{}}
      fields={[
        { key: "question", label: "Pertanyaan", type: "text", required: true, full: true },
        { key: "answer", label: "Jawaban", type: "textarea", required: true },
      ]}
      renderItem={(item) => {
        const f = item as unknown as Faq;
        return (
          <div>
            <p className="font-bold text-navy">{f.question}</p>
            <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{f.answer}</p>
          </div>
        );
      }}
    />
  );
}

export function AreaManager({ items }: { items: ShippingArea[] }) {
  return (
    <CollectionManager
      table="shipping_areas"
      noun="area"
      icon={<Truck className="size-7" />}
      items={asRows(items)}
      defaults={{ fee: 0 }}
      fields={[
        { key: "name", label: "Nama area", type: "text", required: true, placeholder: "Jakarta Selatan" },
        { key: "eta", label: "Estimasi kirim", type: "text", placeholder: "Hari yang sama (order < 12.00)" },
        { key: "fee", label: "Ongkir", type: "rupiah", required: true },
        { key: "min_free_shipping", label: "Gratis ongkir mulai", type: "rupiah", placeholder: "Pakai pengaturan umum", hint: "Kosongkan untuk memakai batas gratis ongkir global" },
      ]}
      renderItem={(item) => {
        const a = item as unknown as ShippingArea;
        return (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-navy">{a.name}</p>
              <p className="truncate text-xs text-slate-400">{a.eta}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold text-slate-700">{formatRupiah(a.fee)}</p>
              {a.min_free_shipping && <p className="text-[11px] font-semibold text-emerald-600">Gratis ≥ {formatRupiah(a.min_free_shipping)}</p>}
            </div>
          </div>
        );
      }}
    />
  );
}

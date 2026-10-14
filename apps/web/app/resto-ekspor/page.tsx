import {
  BadgeCheck,
  CalendarClock,
  ChefHat,
  FileText,
  Hotel,
  Plane,
  Ruler,
  Snowflake,
  Truck,
  UtensilsCrossed,
  Warehouse,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { QuoteForm } from "@/components/quote-form";
import { TestimonialCard } from "@/components/testimonials";
import { SectionHeading } from "@/components/ui";
import { getSettings, getTestimonials } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Supply Resto, Hotel, Katering & Ekspor",
  description: "Supplier seafood untuk restoran, hotel, katering, dan ekspor. Harga kontrak, kirim rutin setiap pagi, spesifikasi sesuai kebutuhan dapur.",
};

export default async function B2BPage() {
  const [settings, testimonials] = await Promise.all([getSettings(), getTestimonials()]);
  const b2bTestimonials = testimonials.filter((t) => /resto|katering|hotel|chef/i.test(t.name)).slice(0, 2);

  const benefits = [
    { icon: CalendarClock, title: "Kirim rutin setiap pagi", text: "Jadwal tetap harian/mingguan, sampai sebelum dapur buka." },
    { icon: FileText, title: "Harga kontrak & invoice", text: "Harga stabil per periode, tagihan mingguan/bulanan dengan invoice resmi." },
    { icon: Ruler, title: "Spesifikasi sesuai dapur", text: "Size, potongan, fillet, porsi gram — kami siapkan sesuai SOP Anda." },
    { icon: Snowflake, title: "Rantai dingin terjaga", text: "Es curah, styrofoam, dan armada berpendingin untuk partai besar." },
    { icon: Warehouse, title: "Kapasitas besar", text: "Hingga ±2 ton per hari dari jaringan nelayan & pengepul TPI (data demo)." },
    { icon: BadgeCheck, title: "Legalitas lengkap", text: `${settings.legal.nib}. Dokumen pendukung ekspor tersedia sesuai permintaan.` },
  ];
  const segments = [
    { icon: UtensilsCrossed, label: "Restoran & seafood house" },
    { icon: Hotel, label: "Hotel & resort" },
    { icon: ChefHat, label: "Katering & cloud kitchen" },
    { icon: Plane, label: "Eksportir & trading" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: "Resto & Ekspor" }]}
        title="Partner supply seafood untuk bisnis Anda"
        description={`Dipercaya ${settings.trust.partners} restoran, hotel & katering. Langsung dari TPI Muara Angke — kualitas konsisten, harga tangan pertama.`}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {segments.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold ring-1 ring-white/15">
              <Icon className="size-4 text-cyan" /> {label}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="container-page py-12 sm:py-16">
        <SectionHeading eyebrow="Keunggulan" title="Kenapa bisnis memilih Syauqi" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <Icon className="size-8 text-brand-600" />
              <h3 className="mt-3 text-lg font-bold text-navy">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ice py-12 sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="Minta penawaran"
              title="Ceritakan kebutuhan Anda"
              description="Isi form singkat ini — permintaan langsung terkirim ke WhatsApp tim B2B kami. Penawaran harga dikirim di hari yang sama."
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <Image src="/img/b2b-ikan.webp" alt="Stok ikan untuk katering" fill sizes="25vw" className="object-cover" />
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <Image src="/img/lapak-cumi.webp" alt="Cumi partai besar" fill sizes="25vw" className="object-cover" />
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><Truck className="size-4 text-brand-600" /> Gratis ongkir untuk order rutin di Jabodetabek</li>
              <li className="flex items-center gap-2"><BadgeCheck className="size-4 text-brand-600" /> Sampel gratis untuk resto baru</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-brand-900/5 sm:p-8">
            <QuoteForm />
          </div>
        </div>
      </section>

      {b2bTestimonials.length > 0 && (
        <section className="container-page py-12 sm:py-16">
          <SectionHeading eyebrow="Mitra kami" title="Kata mitra bisnis" />
          <div className="grid gap-4 md:grid-cols-2">
            {b2bTestimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

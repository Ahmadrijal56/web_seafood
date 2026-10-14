import { formatDateLong, formatRupiah, todayJakarta, waLink } from "@sfs/shared";
import { ArrowRight, BadgeCheck, CalendarDays, Hotel, Scale, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BannerCarousel } from "@/components/banner-carousel";
import { BundleCard } from "@/components/bundle-card";
import { Bubbles, Wave } from "@/components/decor";
import { FaqList } from "@/components/faq-list";
import { CategoryIcon, WhatsAppIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ClosingCta, LocationSection, ProcessSteps, WhyUs } from "@/components/sections";
import { TestimonialStrip } from "@/components/testimonials";
import { ButtonLink, SectionHeading, buttonClass } from "@/components/ui";
import { VideoGrid } from "@/components/video-grid";
import {
  activeBanners,
  getBanners,
  getBundles,
  getCategories,
  getFaqs,
  getProducts,
  getSettings,
  getTestimonials,
  getVideos,
} from "@/lib/data";
import { toSummary } from "@/lib/product";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, categories, products, bundles, banners, testimonials, videos, faqs] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts(),
    getBundles(),
    getBanners(),
    getTestimonials(),
    getVideos(),
    getFaqs(),
  ]);

  const summaries = products.map(toSummary);
  const todays = summaries
    .filter((p) => p.stockStatus !== "out" && (p.badges.includes("today_catch") || p.isFeatured))
    .slice(0, 10);
  const bestSellers = [...summaries].filter((p) => p.stockStatus !== "out").sort((a, b) => b.soldCount - a.soldCount).slice(0, 8);
  const heroPrice = summaries.find((p) => p.slug === "udang-vaname") ?? summaries.find((p) => p.showPrice && p.pricePerKg);
  const counts = new Map<string, number>();
  for (const p of summaries) if (p.categorySlug) counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: settings.store_name,
    image: `${SITE_URL}/brand/logo.png`,
    url: SITE_URL,
    telephone: `+${settings.whatsapp}`,
    priceRange: "Rp",
    address: {
      "@type": "PostalAddress",
      streetAddress: "TPI Muara Angke Blok A No. 67–70",
      addressLocality: "Penjaringan, Jakarta Utara",
      addressRegion: "DKI Jakarta",
      addressCountry: "ID",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: settings.hours.open,
      closes: settings.hours.close,
    },
    sameAs: Object.values(settings.socials),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-brand-900 to-brand-700 text-white">
        <Bubbles />
        <div className="absolute -right-40 -top-40 size-[520px] rounded-full bg-cyan/20 blur-3xl" />
        <div className="container-page relative grid items-center gap-10 pb-20 pt-10 sm:pb-28 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-32 lg:pt-16">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan ring-1 ring-white/15 backdrop-blur">
              <BadgeCheck className="size-4" /> Sejak {settings.trust.since} · Lapak TPI Muara Angke Blok A 67–70
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Seafood Segar <span className="bg-gradient-to-r from-cyan to-brand-200 bg-clip-text text-transparent">Langsung dari TPI</span> Muara Angke
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-100/90 sm:text-lg">
              Lebih segar, harga tangan pertama. Eceran &amp; grosir, supply resto &amp; ekspor. Nggak perlu ke pasar subuh-subuh — kami antar ke rumah Anda.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/produk" size="lg">
                Lihat Produk <ArrowRight className="size-5" />
              </ButtonLink>
              <a
                href={waLink(settings.whatsapp, "Halo Syauqi Fresh Seafood, saya mau tanya stok & harga hari ini 🙏")}
                target="_blank"
                rel="noopener"
                className={buttonClass("wa", "lg")}
              >
                <WhatsAppIcon size={20} /> Pesan via WhatsApp
              </a>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-semibold text-brand-100 sm:flex sm:flex-wrap sm:gap-x-6">
              {[
                { icon: BadgeCheck, label: `Sejak ${settings.trust.since}` },
                { icon: ShieldCheck, label: "Garansi Segar" },
                { icon: Scale, label: "Berat Pas" },
                { icon: Truck, label: "Kirim Hari Ini" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-5 text-cyan" /> {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="grid grid-cols-[1.25fr_1fr] gap-3 sm:gap-4">
              <div className="relative row-span-2 aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl ring-4 ring-white/10">
                <Image src="/img/hero-udang.webp" alt="Udang segar Syauqi Fresh Seafood" fill priority sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-[1.5rem] shadow-xl ring-4 ring-white/10">
                <Image src="/img/hero-kakap.webp" alt="Kakap merah segar" fill priority sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-[1.5rem] shadow-xl ring-4 ring-white/10">
                <Image src="/img/hero-kepiting.webp" alt="Kepiting bakau hidup" fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
              </div>
            </div>
            {heroPrice && settings.show_prices && heroPrice.showPrice && heroPrice.pricePerKg && (
              <Link
                href={`/produk/${heroPrice.slug}`}
                className="absolute -bottom-6 left-2 flex animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-5 text-navy shadow-2xl sm:-left-6"
              >
                <span className="relative size-12 overflow-hidden rounded-xl">
                  {heroPrice.image && <Image src={heroPrice.image} alt="" fill sizes="48px" className="object-cover" />}
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-emerald-600">● Harga hari ini</span>
                  <span className="block text-sm font-bold">{heroPrice.name}</span>
                  <span className="block text-lg font-extrabold text-coral">{formatRupiah(heroPrice.pricePerKg)}/kg</span>
                </span>
              </Link>
            )}
            <div className="absolute -right-2 -top-4 hidden rotate-6 items-center gap-2 rounded-2xl bg-coral px-4 py-2 text-sm font-bold shadow-xl sm:flex">
              🐟 Tangkapan subuh tadi
            </div>
          </div>
        </div>
        <Wave className="absolute inset-x-0 bottom-0 h-12 sm:h-20" />
      </section>

      {/* 2. Kategori */}
      <section className="container-page -mt-2 pb-4 pt-6 sm:pt-10">
        <div className="no-scrollbar -mx-4 -my-3 flex gap-3 overflow-x-auto px-4 py-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/produk?kategori=${c.slug}`}
              className="group relative flex w-36 shrink-0 flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg sm:w-auto"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                {c.image_url && <Image src={c.image_url} alt={c.name} fill sizes="200px" className="object-cover transition duration-500 group-hover:scale-110" />}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                <span className="absolute bottom-2 left-2 grid size-9 place-items-center rounded-xl bg-white/95 text-brand-600 shadow">
                  <CategoryIcon icon={c.icon} size={20} />
                </span>
              </div>
              <div className="p-3">
                <p className="font-bold text-navy">{c.name}</p>
                <p className="text-xs text-slate-500">{counts.get(c.slug) ?? 0} produk</p>
              </div>
            </Link>
          ))}
          <Link
            href="/paket"
            className="group relative flex w-36 shrink-0 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-coral to-rose-500 p-4 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-auto"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-white/20">
              <CategoryIcon icon="package" size={22} />
            </span>
            <div>
              <p className="text-lg font-extrabold leading-tight">Paket Hemat</p>
              <p className="text-xs text-white/85">Bundling hemat s.d. 10%</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Banner promo */}
      {activeBanners(banners).length > 0 && (
        <section className="container-page py-6">
          <BannerCarousel banners={activeBanners(banners)} />
        </section>
      )}

      {/* 3. Harga hari ini */}
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Harga hari ini"
            title="Tangkapan segar hari ini"
            description={
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                  <CalendarDays className="size-4" /> Update {formatDateLong(todayJakarta())}
                </span>
                <span className="mt-2 block text-sm">{settings.today_price_note}</span>
              </>
            }
            action={
              <Link href="/produk" className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
                Semua produk <ArrowRight className="size-4" />
              </Link>
            }
          />
        </div>
        <div className="container-page">
          <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8">
            {todays.map((p, i) => (
              <ProductCard key={p.id} product={p} showPrices={settings.show_prices} priority={i < 2} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[19%]" />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Best seller */}
      <section className="bg-gradient-to-b from-white to-ice pb-16 sm:pb-24">
        <div className="container-page">
          <SectionHeading eyebrow="Paling laris" title="Best seller pilihan pelanggan" />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} showPrices={settings.show_prices} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Kenapa kami */}
      <WhyUs settings={settings} />

      {/* 6. Proses */}
      <ProcessSteps />

      {/* 7. Paket hemat */}
      {bundles.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="container-page">
            <SectionHeading
              eyebrow="Paket hemat"
              title="Lebih hemat dengan paket bundling"
              description="Sudah kami racik untuk menu favorit keluarga. Tinggal masak!"
              action={
                <Link href="/paket" className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
                  Semua paket <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bundles.map((b) => (
                <BundleCard key={b.id} bundle={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Video */}
      {videos.length > 0 && (
        <section className="bg-ice py-16 sm:py-24">
          <div className="container-page">
            <SectionHeading
              eyebrow="Lihat langsung"
              title="Aktivitas nyata di lapak & dapur kami"
              description="Konten asli dari channel YouTube Syauqi Fresh Seafood — mukbang, belanja harian, dan edukasi seafood."
              action={
                <a href={settings.socials.youtube} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
                  Kunjungi channel <ArrowRight className="size-4" />
                </a>
              }
            />
            <VideoGrid videos={videos} />
          </div>
        </section>
      )}

      {/* 9. Testimoni */}
      {testimonials.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="container-page">
            <SectionHeading
              eyebrow={`Rating ${settings.trust.rating}/5 dari ${settings.trust.customers} pelanggan`}
              title="Kata mereka yang sudah langganan"
              action={
                <Link href="/testimoni" className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
                  Semua testimoni <ArrowRight className="size-4" />
                </Link>
              }
            />
            <TestimonialStrip items={testimonials.slice(0, 6)} />
          </div>
        </section>
      )}

      {/* 10. Banner B2B */}
      <section className="container-page pb-16 sm:pb-24">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-navy text-white lg:grid-cols-2">
          <div className="relative z-10 p-8 sm:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan/15 px-3 py-1 text-xs font-bold text-cyan">
              <Hotel className="size-4" /> Resto · Hotel · Katering · Ekspor
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Butuh supply rutin? Minta penawaran khusus.</h2>
            <p className="mt-4 text-brand-100/85">
              Harga kontrak, jadwal kirim tetap setiap pagi, ukuran sesuai spesifikasi dapur Anda. Dipercaya {settings.trust.partners} resto &amp; katering.
            </p>
            <ButtonLink href="/resto-ekspor" variant="coral" size="lg" className="mt-8">
              Minta Penawaran <ArrowRight className="size-5" />
            </ButtonLink>
          </div>
          <div className="relative min-h-64">
            <Image src="/img/b2b-udang.webp" alt="Supply udang untuk restoran" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/30 to-transparent lg:via-navy/20" />
          </div>
        </div>
      </section>

      {/* 11. FAQ singkat */}
      {faqs.length > 0 && (
        <section className="bg-ice py-16 sm:py-24">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeading
              eyebrow="FAQ"
              title="Pertanyaan yang sering ditanyakan"
              description={
                <>
                  Belum terjawab?{" "}
                  <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener" className="font-bold text-wa-600 underline">
                    Chat admin kami
                  </a>{" "}
                  atau lihat <Link href="/faq" className="font-bold text-brand-600 underline">FAQ lengkap &amp; info ongkir</Link>.
                </>
              }
            />
            <FaqList faqs={faqs.slice(0, 5)} />
          </div>
        </section>
      )}

      {/* 12. Lokasi */}
      <LocationSection settings={settings} />

      {/* 13. CTA penutup */}
      <ClosingCta settings={settings} />
    </>
  );
}

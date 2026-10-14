import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { LocationSection, ProcessSteps, WhyUs } from "@/components/sections";
import { SectionHeading } from "@/components/ui";
import { getSettings } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Cerita Syauqi Fresh Seafood — lapak seafood di TPI Muara Angke sejak 2021.",
};

const TIMELINE = [
  { year: "2021", text: "Membuka lapak di TPI Muara Angke Blok A, melayani pembeli eceran setiap subuh." },
  { year: "2022", text: "Mulai melayani pesanan online via WhatsApp & pengiriman se-Jakarta." },
  { year: "2023", text: "Konten mukbang & edukasi seafood di YouTube, Instagram & TikTok makin dikenal." },
  { year: "2024+", text: "Supply rutin untuk restoran, hotel, katering, dan permintaan ekspor." },
];

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        crumbs={[{ label: "Tentang Kami" }]}
        title={`Dari lapak TPI, melayani sejak ${settings.trust.since}`}
        description="Kami bukan gudang besar — kami pedagang seafood yang setiap subuh ada di lelang Muara Angke, memilih langsung yang terbaik untuk Anda."
      />

      <section className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Cerita kami" title="Seafood segar seharusnya tidak sulit didapat" />
          <div className="space-y-4 leading-relaxed text-slate-600">
            <p>
              Syauqi Fresh Seafood berawal dari lapak kecil di TPI Muara Angke Blok A No. 67–70. Setiap hari kami melihat seafood terbaik
              langsung dari kapal nelayan — sementara banyak keluarga dan restoran di Jakarta kesulitan mendapatkan yang benar-benar segar.
            </p>
            <p>
              Karena itu kami mulai melayani pesanan online: Anda cukup pilih dari HP, kami yang ke lelang subuh-subuh, menyortir, menimbang,
              mengemas dengan es, dan mengantar sampai dapur Anda di hari yang sama.
            </p>
            <p>
              Lewat channel YouTube, Instagram, dan TikTok, kami juga berbagi edukasi jenis-jenis seafood, belanja harian di lapak, sampai
              mukbang — supaya Anda bisa melihat sendiri barang yang kami jual.
            </p>
          </div>
          <ol className="mt-8 space-y-4 border-l-2 border-brand-100 pl-6">
            {TIMELINE.map((t) => (
              <li key={t.year} className="relative">
                <span className="absolute -left-[33px] top-1 size-4 rounded-full border-4 border-white bg-brand-600 shadow" />
                <p className="font-extrabold text-brand-600">{t.year}</p>
                <p className="text-sm text-slate-600">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            ["/img/lapak-hidup.webp", "Ikan hidup di kolam lapak"],
            ["/img/lapak-bawal.webp", "Bawal putih di lapak"],
            ["/img/lapak-selar.webp", "Selar kuning segar"],
            ["/img/proses-packing.webp", "Packing styrofoam + es"],
          ].map(([src, alt], i) => (
            <div key={src} className={`relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lg ${i % 2 ? "translate-y-6" : ""}`}>
              <Image src={src!} alt={alt!} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <ProcessSteps />
      <WhyUs settings={settings} />
      <LocationSection settings={settings} />
    </>
  );
}

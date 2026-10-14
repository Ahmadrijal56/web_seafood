import type { Metadata } from "next";
import Image from "next/image";
import { InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { Stars, TestimonialCard } from "@/components/testimonials";
import { SectionHeading } from "@/components/ui";
import { VideoGrid } from "@/components/video-grid";
import { getProducts, getSettings, getTestimonials, getVideos } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Testimoni & Galeri",
  description: "Testimoni pelanggan, video, dan foto asli lapak Syauqi Fresh Seafood di TPI Muara Angke.",
};

export default async function TestimonialsPage() {
  const [settings, testimonials, videos, products] = await Promise.all([getSettings(), getTestimonials(), getVideos(), getProducts()]);
  const gallery = [
    "/img/lapak-hidup.webp",
    "/img/proses-tpi.webp",
    "/img/lapak-selar.webp",
    "/img/proses-sortir.webp",
    ...products.flatMap((p) => p.product_images?.slice(0, 1).map((i) => i.url) ?? []),
  ].slice(0, 16);

  return (
    <>
      <PageHero
        crumbs={[{ label: "Testimoni & Galeri" }]}
        title="Bukti nyata, bukan janji"
        description="Testimoni pelanggan, video aktivitas, dan foto asli dari lapak kami."
      >
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
          <span className="text-3xl font-extrabold">{settings.trust.rating}</span>
          <span>
            <Stars rating={5} />
            <span className="text-xs text-brand-100/80">dari {settings.trust.customers} pelanggan</span>
          </span>
        </div>
      </PageHero>

      <section className="container-page py-12 sm:py-16">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </section>

      {videos.length > 0 && (
        <section className="bg-ice py-12 sm:py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Video" title="Dari channel Syauqi Fresh Seafood" />
            <VideoGrid videos={videos} featureFirst={false} />
          </div>
        </section>
      )}

      <section className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow="Galeri"
          title="Foto asli lapak & produk"
          action={
            <div className="flex gap-2">
              {[
                { href: settings.socials.instagram, Icon: InstagramIcon, label: "Instagram" },
                { href: settings.socials.youtube, Icon: YouTubeIcon, label: "YouTube" },
                { href: settings.socials.tiktok, Icon: TikTokIcon, label: "TikTok" },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-brand-700">
                  <Icon size={16} /> {label}
                </a>
              ))}
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((src, i) => (
            <div key={src} className={`relative overflow-hidden rounded-2xl bg-brand-50 ${i % 5 === 0 ? "row-span-2" : ""}`}>
              <div className={i % 5 === 0 ? "relative h-full min-h-64" : "relative aspect-square"}>
                <Image src={src} alt="Foto Syauqi Fresh Seafood" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 hover:scale-105" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

import { describeDays, formatRupiah, waLink } from "@sfs/shared";
import { Clock, Refrigerator, Snowflake, ThermometerSnowflake, Truck } from "lucide-react";
import type { Metadata } from "next";
import { FaqList } from "@/components/faq-list";
import { WhatsAppIcon } from "@/components/icons";
import { OpenStatus } from "@/components/open-status";
import { PageHero } from "@/components/page-hero";
import { SectionHeading, buttonClass } from "@/components/ui";
import { getFaqs, getSettings, getShippingAreas } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "FAQ & Info Pengiriman",
  description: "Pertanyaan umum, area & ongkir pengiriman, jam operasional, dan cara menyimpan seafood.",
};

const STORAGE_TIPS = [
  { icon: Refrigerator, title: "Kulkas (0–4°C)", text: "Ikan & udang segar tahan 1–2 hari. Simpan di rak paling bawah dalam wadah tertutup." },
  { icon: Snowflake, title: "Freezer (-18°C)", text: "Tahan hingga 1–3 bulan. Bagi per porsi masak agar tidak bolak-balik dicairkan." },
  { icon: ThermometerSnowflake, title: "Mencairkan", text: "Pindahkan ke kulkas semalam, atau rendam kantong tertutup di air dingin. Hindari air panas." },
];

export default async function FaqPage() {
  const [faqs, settings, areas] = await Promise.all([getFaqs(), getSettings(), getShippingAreas()]);
  return (
    <>
      <PageHero crumbs={[{ label: "FAQ & Pengiriman" }]} title="FAQ & info pengiriman" description="Semua yang perlu Anda tahu sebelum memesan." />

      <section className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <SectionHeading eyebrow="FAQ" title="Pertanyaan umum" />
          <FaqList faqs={faqs} />
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
              <Truck className="size-5 text-brand-600" /> Area & ongkir
            </h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 font-semibold">Area</th>
                  <th className="pb-2 text-right font-semibold">Ongkir</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100 align-top">
                    <td className="py-2.5">
                      <span className="font-semibold text-navy">{a.name}</span>
                      {a.eta && <span className="block text-xs text-slate-500">{a.eta}</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="font-bold text-navy">{formatRupiah(a.fee)}</span>
                      {(a.min_free_shipping ?? settings.free_shipping_min) && (
                        <span className="block text-xs text-emerald-600">
                          Gratis ≥ {formatRupiah((a.min_free_shipping ?? settings.free_shipping_min)!)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-slate-500">Ambil sendiri di lapak TPI: gratis.</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
              <Clock className="size-5 text-brand-600" /> Jam operasional
            </h2>
            <p className="mt-2 text-slate-600">
              {describeDays(settings.hours.days)}, {settings.hours.open}–{settings.hours.close} WIB
            </p>
            <OpenStatus hours={settings.hours} className="mt-3" />
            <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener" className={buttonClass("wa", "md", "mt-5 w-full")}>
              <WhatsAppIcon size={18} /> Tanya admin
            </a>
          </div>
        </div>
      </section>

      <section className="bg-ice py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Tips" title="Cara menyimpan seafood agar tetap segar" />
          <div className="grid gap-4 md:grid-cols-3">
            {STORAGE_TIPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl bg-white p-6 shadow-sm">
                <Icon className="size-8 text-brand-600" />
                <h3 className="mt-3 text-lg font-bold text-navy">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { BundleCard } from "@/components/bundle-card";
import { PageHero } from "@/components/page-hero";
import { GuaranteeBox } from "@/components/sections";
import { getBundles, getSettings } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Paket Hemat Seafood",
  description: "Paket bundling seafood segar lebih hemat: Paket Bakar Keluarga, Paket Saus Padang, Paket Stok Kulkas.",
};

export default async function BundlesPage() {
  const [bundles, settings] = await Promise.all([getBundles(), getSettings()]);
  return (
    <>
      <PageHero
        crumbs={[{ label: "Paket Hemat" }]}
        title="Paket hemat, tinggal masak"
        description="Kombinasi seafood favorit yang sudah kami racik — lebih hemat dibanding beli satuan."
      />
      <div className="container-page pb-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b) => (
            <BundleCard key={b.id} bundle={b} />
          ))}
        </div>
        <div className="mt-10">
          <GuaranteeBox settings={settings} />
        </div>
      </div>
    </>
  );
}

import { BADGE_LABELS, formatRupiah, priceLadder } from "@sfs/shared";
import { ChefHat, ChevronRight, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BundleCard } from "@/components/bundle-card";
import { ProductCard } from "@/components/product-card";
import { PriceTag, ProductBadges, StockLabel, TypeChip } from "@/components/product-bits";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { GuaranteeBox } from "@/components/sections";
import { SectionHeading } from "@/components/ui";
import { getBundles, getProduct, getProducts, getSettings } from "@/lib/data";
import { toSummary } from "@/lib/product";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produk/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = product.product_images?.[0]?.url;
  return {
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.short_description ?? undefined,
    openGraph: { images: image ? [{ url: image }] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/produk/[slug]">) {
  const { slug } = await params;
  const [product, settings, all, bundles] = await Promise.all([getProduct(slug), getSettings(), getProducts(), getBundles()]);
  if (!product) notFound();

  const summary = toSummary(product);
  const images = (product.product_images ?? []).map((i) => i.url);
  const ladder = priceLadder(product, summary.tiers);
  const weights = (product.product_options ?? []).filter((o) => o.kind === "weight" && o.value).map((o) => Number(o.value));
  const processing = (product.product_options ?? [])
    .filter((o) => o.kind === "processing")
    .map((o) => ({ id: o.id, label: o.label, extra: o.extra_price }));
  const showPrice = settings.show_prices && product.show_price;

  const related = all
    .filter((p) => p.id !== product.id && p.category_id === product.category_id && p.stock_status !== "out")
    .slice(0, 4)
    .map(toSummary);
  const crossSell = all
    .filter((p) => p.id !== product.id && p.category_id !== product.category_id && p.badges.includes("best_seller"))
    .slice(0, 4)
    .map(toSummary);
  const bundleWith = bundles.filter((b) => b.bundle_items?.some((i) => i.product_id === product.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description ?? product.short_description,
    brand: { "@type": "Brand", name: settings.store_name },
    offers:
      showPrice && product.price_per_kg
        ? {
            "@type": "Offer",
            url: `${SITE_URL}/produk/${product.slug}`,
            priceCurrency: "IDR",
            price: product.price_per_kg,
            availability: product.stock_status === "out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            seller: { "@id": `${SITE_URL}/#business` },
          }
        : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-page pb-16 pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <Link href="/" className="hover:text-navy">Beranda</Link>
          <ChevronRight className="size-3" />
          <Link href="/produk" className="hover:text-navy">Produk</Link>
          {product.category && (
            <>
              <ChevronRight className="size-3" />
              <Link href={`/produk?kategori=${product.category.slug}`} className="hover:text-navy">{product.category.name}</Link>
            </>
          )}
          <ChevronRight className="size-3" />
          <span className="font-semibold text-navy">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={images} name={product.name} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TypeChip type={product.type} className="bg-brand-50 ring-1 ring-brand-100" />
              <ProductBadges badges={product.badges} />
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              {product.size_label && <span className="font-semibold">{product.size_label}</span>}
              <StockLabel status={product.stock_status} />
              <span>{product.sold_count}+ terjual</span>
            </div>
            {product.short_description && <p className="mt-4 leading-relaxed text-slate-600">{product.short_description}</p>}

            <div className="mt-5">
              <PriceTag price={product.price_per_kg} compare={product.compare_price} showPrice={showPrice} size="lg" />
            </div>

            {showPrice && ladder.length > 1 && (
              <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-emerald-100">
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800">
                  <Scale className="size-4" /> Harga grosir — makin banyak makin hemat
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {ladder.map((step) => (
                      <tr key={step.minKg} className="border-t border-emerald-50">
                        <td className="px-4 py-2 text-slate-600">
                          {step.minKg === 0 ? `< ${step.maxKg} kg` : step.maxKg ? `${step.minKg}–${step.maxKg - 1} kg` : `≥ ${step.minKg} kg`}
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-navy">{formatRupiah(step.price)}/kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-6">
              <ProductPurchase product={summary} weights={weights} processing={processing} />
            </div>

            <div className="mt-6">
              <GuaranteeBox settings={settings} />
            </div>

            {product.description && (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-navy">Deskripsi</h2>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">{product.description}</p>
                {product.badges.length > 0 && (
                  <p className="mt-3 text-sm text-slate-500">Label: {product.badges.map((b) => BADGE_LABELS[b]).join(", ")}</p>
                )}
              </section>
            )}
            {product.cooking_tips && (
              <section className="mt-6 rounded-3xl bg-amber-50 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
                  <ChefHat className="size-5 text-coral" /> Ide masak &amp; tips simpan
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
                  {product.cooking_tips.split("\n").map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="text-coral">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {bundleWith.length > 0 && (
          <section className="mt-16">
            <SectionHeading eyebrow="Lebih hemat" title={`Paket berisi ${product.name}`} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bundleWith.map((b) => (
                <BundleCard key={b.id} bundle={b} />
              ))}
            </div>
          </section>
        )}

        {crossSell.length > 0 && (
          <section className="mt-16">
            <SectionHeading eyebrow="Sering dibeli bersama" title="Lengkapi menu seafood Anda" />
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {crossSell.map((p) => (
                <ProductCard key={p.id} product={p} showPrices={settings.show_prices} />
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <SectionHeading eyebrow="Produk terkait" title={`${product.category?.name ?? "Produk"} lainnya`} />
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} showPrices={settings.show_prices} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

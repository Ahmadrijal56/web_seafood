import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/product";
import { cn } from "@/lib/utils";
import { PriceTag, ProductBadges, TypeChip } from "./product-bits";
import { QuickAdd } from "./quick-add";

export function ProductCard({
  product,
  showPrices,
  className,
  priority,
}: {
  product: ProductSummary;
  showPrices: boolean;
  className?: string;
  priority?: boolean;
}) {
  const soldOut = product.stockStatus === "out";
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10",
        className,
      )}
    >
      <Link href={`/produk/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-brand-50">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn("object-cover transition duration-500 group-hover:scale-105", product.image2 && "group-hover:opacity-0")}
          />
        )}
        {product.image2 && (
          <Image
            src={product.image2}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        )}
        <ProductBadges badges={product.badges.slice(0, 2)} className="absolute left-2 top-2 flex-col items-start sm:left-2.5 sm:top-2.5" />
        <TypeChip type={product.type} className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5" />
        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-navy/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-navy">Stok Habis</span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div>
          <Link href={`/produk/${product.slug}`} className="line-clamp-1 font-bold text-navy hover:text-brand-600 sm:text-[17px]">
            {product.name}
          </Link>
          <p className="line-clamp-1 text-xs text-slate-500">{product.sizeLabel ?? product.categoryName}</p>
        </div>
        <div className="mt-auto">
          <PriceTag
            price={product.pricePerKg}
            compare={product.comparePrice}
            showPrice={showPrices && product.showPrice}
            lowest={product.lowestPrice}
          />
        </div>
        <QuickAdd product={product} disabled={soldOut} />
      </div>
    </article>
  );
}

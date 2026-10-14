import { BADGE_LABELS, discountPercent, formatRupiah, formatRupiahShort, type Badge, type StockStatus } from "@sfs/shared";
import { Flame, Snowflake, Sparkles, Tag, Timer, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "./ui";

const BADGE_STYLE: Record<Badge, { className: string; icon: typeof Flame }> = {
  today_catch: { className: "bg-cyan text-navy", icon: Waves },
  best_seller: { className: "bg-coral text-white", icon: Flame },
  promo: { className: "bg-rose-500 text-white", icon: Tag },
  limited: { className: "bg-amber-400 text-navy", icon: Timer },
};

export function ProductBadges({ badges, className }: { badges: Badge[]; className?: string }) {
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((badge) => {
        const style = BADGE_STYLE[badge];
        const Icon = style.icon;
        return (
          <Chip key={badge} className={cn("shadow-sm", style.className)}>
            <Icon className="size-3" strokeWidth={2.5} />
            {BADGE_LABELS[badge]}
          </Chip>
        );
      })}
    </div>
  );
}

export function TypeChip({ type, className }: { type: "fresh" | "frozen"; className?: string }) {
  return type === "frozen" ? (
    <Chip className={cn("bg-white/90 text-brand-700 backdrop-blur", className)}>
      <Snowflake className="size-3" /> Frozen
    </Chip>
  ) : (
    <Chip className={cn("bg-white/90 text-emerald-700 backdrop-blur", className)}>
      <Sparkles className="size-3" /> Fresh
    </Chip>
  );
}

export function StockLabel({ status }: { status: StockStatus }) {
  if (status === "available") return <span className="text-xs font-semibold text-emerald-600">● Stok tersedia</span>;
  if (status === "limited") return <span className="text-xs font-semibold text-amber-600">● Stok terbatas</span>;
  return <span className="text-xs font-semibold text-rose-600">● Stok habis</span>;
}

export function PriceTag({
  price,
  compare,
  showPrice,
  lowest,
  size = "md",
  unit = "/kg",
}: {
  price: number | null;
  compare?: number | null;
  showPrice: boolean;
  lowest?: number | null;
  size?: "md" | "lg";
  unit?: string;
}) {
  if (!showPrice || price == null) {
    return (
      <div>
        <span className={cn("inline-flex items-center rounded-lg bg-brand-50 font-bold text-brand-700", size === "lg" ? "px-3 py-1.5 text-lg" : "px-2 py-1 text-sm")}>
          Tanya Harga
        </span>
        <p className="mt-1 text-[11px] text-slate-500">Harga mengikuti lelang hari ini</p>
      </div>
    );
  }
  const discount = discountPercent(price, compare ?? null);
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={cn("font-extrabold tracking-tight text-navy", size === "lg" ? "text-3xl" : "text-lg")}>
          {formatRupiah(price)}
          <span className={cn("font-semibold text-slate-500", size === "lg" ? "text-base" : "text-xs")}>{unit}</span>
        </span>
        {compare && discount && (
          <span className="flex items-center gap-1.5">
            <s className="text-xs text-slate-400">{formatRupiah(compare)}</s>
            <span className="rounded bg-rose-50 px-1 text-[11px] font-bold text-rose-600">-{discount}%</span>
          </span>
        )}
      </div>
      {lowest != null && lowest < price && (
        <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">Grosir mulai {formatRupiahShort(lowest)}/kg</p>
      )}
    </div>
  );
}

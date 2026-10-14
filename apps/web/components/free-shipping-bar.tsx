import { formatRupiah, freeShippingProgress } from "@sfs/shared";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export function FreeShippingBar({ subtotal, threshold, className }: { subtotal: number; threshold: number | null; className?: string }) {
  const progress = freeShippingProgress(subtotal, threshold);
  if (!progress) return null;
  return (
    <div className={cn("rounded-2xl bg-brand-50 p-3", className)}>
      <p className="flex items-center gap-2 text-sm font-semibold text-navy">
        <Truck className="size-4 shrink-0 text-brand-600" />
        {progress.reached ? (
          <span>
            Selamat! Pesanan Anda dapat <span className="text-emerald-600">GRATIS ONGKIR</span> 🎉
          </span>
        ) : (
          <span>
            Tambah <span className="text-coral">{formatRupiah(progress.remaining)}</span> lagi untuk GRATIS ONGKIR
          </span>
        )}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div
          className={cn("h-full rounded-full transition-all duration-500", progress.reached ? "bg-emerald-500" : "bg-gradient-to-r from-cyan to-brand-600")}
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}

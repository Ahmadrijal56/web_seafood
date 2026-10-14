import type { Testimonial } from "@sfs/shared";
import { Quote, Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)} aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-4", i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
      ))}
    </div>
  );
}

export function TestimonialCard({ t, className }: { t: Testimonial; className?: string }) {
  const initials = t.name
    .split("—")[0]!
    .replace(/^(Ibu|Pak|Bu|Mbak|Koh|Chef)\s+/i, "")
    .split(/\s+/)
    .filter((s) => /^\p{L}/u.test(s))
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
  return (
    <figure className={cn("relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm", className)}>
      <Quote className="absolute right-5 top-5 size-8 text-brand-100" />
      <Stars rating={t.rating} />
      {t.image_url && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          <Image src={t.image_url} alt={`Bukti dari ${t.name}`} fill sizes="320px" className="object-cover" />
        </div>
      )}
      <blockquote className="flex-1 text-[15px] leading-relaxed text-slate-700">“{t.content}”</blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-cyan to-brand-600 text-sm font-bold text-white">
          {initials}
        </span>
        <span>
          <span className="block text-sm font-bold text-navy">{t.name}</span>
          {t.city && <span className="block text-xs text-slate-500">{t.city}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimonialStrip({ items }: { items: Testimonial[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
      {items.map((t) => (
        <TestimonialCard key={t.id} t={t} className="w-[85%] shrink-0 snap-center sm:w-[45%] lg:w-auto" />
      ))}
    </div>
  );
}

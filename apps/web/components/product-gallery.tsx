"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return <div className="aspect-[4/5] rounded-3xl bg-brand-50" />;
  return (
    <div className="flex flex-col gap-3">
      <div className="no-scrollbar relative flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto rounded-3xl bg-brand-50 sm:overflow-hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className={cn(
              "relative size-full shrink-0 snap-center sm:absolute sm:inset-0 sm:transition-opacity sm:duration-300",
              i === active ? "sm:opacity-100" : "sm:pointer-events-none sm:opacity-0",
            )}
          >
            <Image src={src} alt={`${name} — foto ${i + 1}`} fill priority={i === 0} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        ))}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
            {images.map((src, i) => (
              <span key={src} className={cn("h-1.5 rounded-full bg-white transition-all", i === active ? "w-5" : "w-1.5 opacity-60")} />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="hidden gap-3 sm:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square w-20 cursor-pointer overflow-hidden rounded-2xl ring-2 transition",
                i === active ? "ring-brand-500" : "ring-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`Lihat foto ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

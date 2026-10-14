"use client";

import type { Banner } from "@sfs/shared";
import { ArrowRight, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Countdown } from "./countdown";

const GRADIENTS = [
  "from-coral via-coral/90 to-rose-500/60",
  "from-navy via-brand-800/95 to-brand-600/60",
  "from-brand-700 via-brand-600/90 to-cyan/50",
];

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el || banners.length < 2) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    const id = setInterval(() => {
      if (document.hidden || el.matches(":hover")) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 6000);
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearInterval(id);
    };
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative">
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-3xl">
        {banners.map((banner, i) => (
          <Link
            key={banner.id}
            href={banner.link ?? "/produk"}
            className="relative flex min-h-56 w-full shrink-0 snap-center overflow-hidden text-white sm:min-h-64"
          >
            {banner.image_url && (
              <Image
                src={banner.image_url}
                alt=""
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
                priority={i === 0}
              />
            )}
            <div className={cn("absolute inset-0 bg-gradient-to-r", GRADIENTS[i % GRADIENTS.length])} />
            <div className="relative flex max-w-xl flex-col justify-center gap-3 p-6 sm:p-10">
              {banner.show_countdown && banner.ends_at && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                  <Timer className="size-3.5" /> Promo terbatas
                </span>
              )}
              <h3 className="text-2xl font-extrabold leading-tight sm:text-3xl">{banner.title}</h3>
              {banner.subtitle && <p className="text-sm text-white/90 sm:text-base">{banner.subtitle}</p>}
              <div className="mt-1 flex flex-wrap items-center gap-4">
                {banner.cta_label && (
                  <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-sm font-bold text-navy">
                    {banner.cta_label} <ArrowRight className="size-4" />
                  </span>
                )}
                {banner.show_countdown && banner.ends_at && <Countdown endsAt={banner.ends_at} />}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-4 right-5 flex gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Banner ${i + 1}`}
              onClick={() => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" })}
              className={cn("h-2 cursor-pointer rounded-full bg-white transition-all", i === index ? "w-6" : "w-2 opacity-60")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

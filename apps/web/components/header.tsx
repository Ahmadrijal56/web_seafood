"use client";

import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import { Logo } from "./logo";
import { OpenStatus } from "./open-status";
import { useStore } from "./store-provider";
import { waLink } from "@sfs/shared";

export const NAV = [
  { href: "/produk", label: "Produk" },
  { href: "/paket", label: "Paket Hemat" },
  { href: "/resto-ekspor", label: "Resto & Ekspor" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/testimoni", label: "Testimoni" },
  { href: "/faq", label: "FAQ & Pengiriman" },
];

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function Header() {
  const { settings } = useStore();
  const pathname = usePathname();
  const count = useCart((s) => s.lines.length);
  const setOpen = useCart((s) => s.setOpen);
  const hydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {settings.announcement && (
        <div className="bg-navy text-center text-xs font-medium text-brand-100">
          <p className="container-page py-2">{settings.announcement}</p>
        </div>
      )}
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-lg" : "border-transparent bg-white",
        )}
      >
        <div className="container-page flex h-16 items-center gap-4 lg:h-[72px]">
          <Logo className="h-11 shrink-0 lg:h-12" />
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-semibold transition",
                  pathname.startsWith(item.href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-navy",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <OpenStatus hours={settings.hours} className="hidden xl:inline-flex" />
            <a
              href={waLink(settings.whatsapp)}
              target="_blank"
              rel="noopener"
              className="hidden h-10 items-center gap-2 rounded-full bg-wa px-4 text-sm font-semibold text-white transition hover:bg-wa-600 md:inline-flex"
            >
              <WhatsAppIcon size={16} /> Chat Admin
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative grid size-11 cursor-pointer place-items-center rounded-full text-navy transition hover:bg-brand-50"
              aria-label="Buka keranjang"
            >
              <ShoppingBag className="size-6" />
              {hydrated && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-coral px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-white">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid size-11 cursor-pointer place-items-center rounded-full text-navy transition hover:bg-brand-50 lg:hidden"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-slate-100 bg-white lg:hidden" aria-label="Navigasi mobile">
            <div className="container-page flex flex-col py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-3 text-base font-semibold",
                    pathname.startsWith(item.href) ? "bg-brand-50 text-brand-700" : "text-navy",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 pt-3">
                <OpenStatus hours={settings.hours} />
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

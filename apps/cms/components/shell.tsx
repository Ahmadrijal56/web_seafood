"use client";

import {
  CircleHelp,
  Clapperboard,
  ClipboardList,
  ExternalLink,
  Fish,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareQuote,
  Package,
  Settings,
  Tags,
  Truck,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn, WEB_URL } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Utama",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/pesanan", label: "Pesanan", icon: ClipboardList },
    ],
  },
  {
    title: "Katalog",
    items: [
      { href: "/produk", label: "Produk", icon: Fish },
      { href: "/harga", label: "Update Harga", icon: Tags },
      { href: "/kategori", label: "Kategori", icon: LayoutGrid },
      { href: "/paket", label: "Paket Hemat", icon: Package },
    ],
  },
  {
    title: "Konten",
    items: [
      { href: "/banner", label: "Banner & Promo", icon: Megaphone },
      { href: "/testimoni", label: "Testimoni", icon: MessageSquareQuote },
      { href: "/video", label: "Video", icon: Clapperboard },
      { href: "/faq", label: "FAQ", icon: CircleHelp },
    ],
  },
  {
    title: "Toko",
    items: [
      { href: "/ongkir", label: "Area & Ongkir", icon: Truck },
      { href: "/pengaturan", label: "Pengaturan Toko", icon: Settings },
      { href: "/akun", label: "Akun & Admin", icon: UserCog },
    ],
  },
];

const MOBILE_NAV = ["/", "/pesanan", "/produk", "/harga"];
const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Shell({ children, email, newOrders }: { children: ReactNode; email: string; newOrders: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  async function logout() {
    await supabaseBrowser().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-5">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200/60">{group.title}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      active ? "bg-white text-navy shadow-sm" : "text-brand-100/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <item.icon className={cn("size-[18px]", active ? "text-brand-600" : "")} />
                    {item.label}
                    {item.href === "/pesanan" && newOrders > 0 && (
                      <span className="ml-auto rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white">{newOrders}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-white/10 pt-4">
      <a href={WEB_URL} target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-brand-100/80 hover:bg-white/10 hover:text-white">
        <ExternalLink className="size-[18px]" /> Lihat Website
      </a>
      <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-brand-100/80 hover:bg-white/10 hover:text-white">
        <LogOut className="size-[18px]" /> Keluar
      </button>
      <p className="truncate px-3 pt-2 text-[11px] text-brand-200/50">{email}</p>
    </div>
  );

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 overflow-y-auto bg-navy px-4 py-5 lg:flex">
        <Brand />
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>

      {/* Top bar mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/icon.png" alt="" width={32} height={32} className="size-8" />
          <span className="text-sm font-extrabold text-navy">Admin Syauqi</span>
        </Link>
        <a href={WEB_URL} target="_blank" className="flex items-center gap-1 text-xs font-bold text-brand-600">
          Lihat Web <ExternalLink className="size-3.5" />
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map((href) => {
            const item = ALL_ITEMS.find((i) => i.href === href)!;
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link href={href} className={cn("relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold", active ? "text-brand-600" : "text-slate-400")}>
                  <item.icon className="size-5" />
                  {item.label.replace("Update ", "")}
                  {href === "/pesanan" && newOrders > 0 && (
                    <span className="absolute right-[22%] top-1 grid min-w-4 place-items-center rounded-full bg-coral px-1 text-[9px] text-white">{newOrders}</span>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setMenuOpen(true)} className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-bold text-slate-400">
              <Menu className="size-5" />
              Lainnya
            </button>
          </li>
        </ul>
      </nav>

      {/* Menu lengkap mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] animate-slide-up overflow-y-auto rounded-t-3xl bg-navy px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <div className="mb-4 flex items-center justify-between">
              <Brand />
              <button type="button" onClick={() => setMenuOpen(false)} className="rounded-xl p-2 text-white/80" aria-label="Tutup menu">
                <X className="size-5" />
              </button>
            </div>
            {nav}
            <div className="mt-5">{footer}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 px-2">
      <Image src="/brand/logo-white.png" alt="Syauqi Fresh Seafood" width={64} height={56} className="h-11 w-auto" />
      <div className="leading-tight">
        <p className="text-sm font-extrabold text-white">Admin Panel</p>
        <p className="text-[11px] text-brand-200/70">Syauqi Fresh Seafood</p>
      </div>
    </Link>
  );
}

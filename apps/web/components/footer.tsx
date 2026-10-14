import { describeDays, waLink, type StoreSettings } from "@sfs/shared";
import { Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from "./icons";
import { Logo } from "./logo";

export function Footer({ settings }: { settings: StoreSettings }) {
  const phone = settings.whatsapp.replace(/^62/, "0").replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  return (
    <footer className="relative mt-auto bg-navy pb-28 text-brand-100 lg:pb-10">
      <div className="container-page grid gap-10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo variant="white" className="h-20" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-100/80">
            Supplier fresh &amp; frozen seafood langsung dari TPI Muara Angke. Eceran &amp; grosir, supply resto, hotel, katering &amp; ekspor.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { href: settings.socials.instagram, label: "Instagram", Icon: InstagramIcon },
              { href: settings.socials.youtube, label: "YouTube", Icon: YouTubeIcon },
              { href: settings.socials.tiktok, label: "TikTok", Icon: TikTokIcon },
              { href: waLink(settings.whatsapp), label: "WhatsApp", Icon: WhatsAppIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener"
                aria-label={label}
                className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-cyan hover:text-navy"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Belanja</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/produk" className="hover:text-white">Semua Produk</Link></li>
            <li><Link href="/produk?kategori=ikan" className="hover:text-white">Ikan Laut</Link></li>
            <li><Link href="/produk?kategori=udang" className="hover:text-white">Udang &amp; Lobster</Link></li>
            <li><Link href="/produk?kategori=kepiting" className="hover:text-white">Kepiting</Link></li>
            <li><Link href="/paket" className="hover:text-white">Paket Hemat</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Info</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/tentang" className="hover:text-white">Tentang Kami</Link></li>
            <li><Link href="/resto-ekspor" className="hover:text-white">Supply Resto &amp; Ekspor</Link></li>
            <li><Link href="/testimoni" className="hover:text-white">Testimoni &amp; Galeri</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ &amp; Pengiriman</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Kunjungi Lapak</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-cyan" />
              <a href={settings.maps_url} target="_blank" rel="noopener" className="hover:text-white">{settings.address}</a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-cyan" />
              <span>{describeDays(settings.hours.days)}, {settings.hours.open}–{settings.hours.close} WIB</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-cyan" />
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener" className="hover:text-white">{phone} (WhatsApp)</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-page mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-brand-100/60 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {settings.store_name}. Melayani sejak {settings.trust.since}.</p>
        <p>{settings.legal.nib}</p>
      </div>
    </footer>
  );
}

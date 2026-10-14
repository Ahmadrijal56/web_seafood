import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { CartDrawer } from "@/components/cart-drawer";
import { FloatingBars } from "@/components/floating-bars";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import { getProducts, getSettings } from "@/lib/data";
import { toSummary } from "@/lib/product";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const noindex = process.env.NEXT_PUBLIC_NOINDEX !== "false";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.store_name} — Seafood Segar TPI Muara Angke`;
  const description =
    "Supplier fresh & frozen seafood langsung dari TPI Muara Angke, Jakarta Utara. Ikan, udang, kepiting, cumi & kerang. Eceran & grosir, supply resto & ekspor. Pesan mudah via WhatsApp.";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${settings.store_name}` },
    description,
    applicationName: settings.store_name,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: settings.store_name,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A2A4A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  const suggestions = products
    .filter((p) => p.is_featured || p.badges.includes("best_seller"))
    .sort((a, b) => b.sold_count - a.sold_count)
    .slice(0, 8)
    .map(toSummary);

  return (
    <html lang="id" className={jakarta.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col font-sans">
        <StoreProvider value={{ settings, suggestions }}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
          <FloatingBars />
        </StoreProvider>
        <Analytics pixels={settings.pixels} />
      </body>
    </html>
  );
}

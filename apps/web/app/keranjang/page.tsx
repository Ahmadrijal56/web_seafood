import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";
import { getShippingAreas } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Keranjang & Checkout",
  robots: { index: false },
};

export default async function CartPage() {
  const areas = await getShippingAreas();
  return (
    <div className="bg-ice">
      <div className="container-page py-8 sm:py-12">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Keranjang &amp; Pesan</h1>
        <Checkout areas={areas} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { OrderSent } from "@/components/order-sent";

export const metadata: Metadata = {
  title: "Pesanan Terkirim",
  robots: { index: false },
};

export default function OrderSentPage() {
  return (
    <div className="bg-ice">
      <div className="container-page py-10 sm:py-16">
        <OrderSent />
      </div>
    </div>
  );
}

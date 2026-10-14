import { Fish } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Fish className="size-10" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-navy">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-md text-slate-600">Sepertinya ikan yang Anda cari sudah berenang jauh. Yuk kembali ke katalog.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/produk">Lihat Produk</ButtonLink>
        <ButtonLink href="/" variant="outline">Beranda</ButtonLink>
      </div>
    </div>
  );
}

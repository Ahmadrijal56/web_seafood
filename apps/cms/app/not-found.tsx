import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="text-5xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-3 text-lg font-extrabold text-navy">Halaman tidak ditemukan</h1>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

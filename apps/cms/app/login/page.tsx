import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/";
  const forbidden = params.error === "forbidden";

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-navy px-4 py-10">
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/brand/logo-white.png" alt="Syauqi Fresh Seafood" width={160} height={141} priority className="h-24 w-auto" />
          <p className="mt-4 text-sm text-brand-100/80">Panel admin untuk mengelola produk, harga & pesanan</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="text-lg font-extrabold text-navy">Masuk ke Admin</h1>
          {forbidden && (
            <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
              Akun ini belum terdaftar sebagai admin. Hubungi pemilik toko.
            </p>
          )}
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-xs text-brand-100/60">© Syauqi Fresh Seafood · TPI Muara Angke</p>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ variant = "color", className }: { variant?: "color" | "white"; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)} aria-label="Syauqi Fresh Seafood — Beranda">
      <Image
        src={variant === "white" ? "/brand/logo-white.png" : "/brand/logo.png"}
        alt="Syauqi Fresh Seafood"
        width={575}
        height={506}
        priority
        className="h-full w-auto"
      />
    </Link>
  );
}

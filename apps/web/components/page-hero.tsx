import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Bubbles, Wave } from "./decor";

export function PageHero({
  title,
  description,
  crumbs,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: { href?: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy via-brand-900 to-brand-700 text-white">
      <Bubbles />
      <div className="container-page relative pb-16 pt-8 sm:pb-20 sm:pt-12">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-brand-100/80">
            <Link href="/" className="hover:text-white">Beranda</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="flex items-center gap-1">
                <ChevronRight className="size-3" />
                {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="text-white">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-brand-100/90 sm:text-lg">{description}</p>}
        {children}
      </div>
      <Wave className="absolute inset-x-0 bottom-0 h-8 sm:h-12" />
    </section>
  );
}

import { ARTICLE_CATEGORY_LABELS, formatDateLong, type Article } from "@sfs/shared";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ArticleCard({ article, className, priority }: { article: Article; className?: string; priority?: boolean }) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10",
        className,
      )}
    >
      <Link href={`/artikel/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-brand-50">
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-brand-50 to-ice" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-navy shadow-sm">
          {ARTICLE_CATEGORY_LABELS[article.category]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <time dateTime={article.published_at} className="text-xs font-medium text-slate-400">
          {formatDateLong(article.published_at)}
        </time>
        <Link href={`/artikel/${article.slug}`} className="line-clamp-2 text-lg font-bold leading-snug text-navy hover:text-brand-600">
          {article.title}
        </Link>
        {article.excerpt && <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">{article.excerpt}</p>}
        <Link href={`/artikel/${article.slug}`} className="mt-1 text-sm font-bold text-brand-600 hover:text-brand-700">
          Baca selengkapnya
        </Link>
      </div>
    </article>
  );
}

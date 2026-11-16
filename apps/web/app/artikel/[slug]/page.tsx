import { ARTICLE_CATEGORY_LABELS, formatDateLong } from "@sfs/shared";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { ClosingCta } from "@/components/sections";
import { SectionHeading } from "@/components/ui";
import { getArticle, getArticles, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/artikel/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.excerpt ?? undefined,
    openGraph: {
      type: "article",
      publishedTime: article.published_at,
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : undefined,
    },
  };
}

export default async function ArtikelDetailPage({ params }: PageProps<"/artikel/[slug]">) {
  const { slug } = await params;
  const [article, all, settings] = await Promise.all([getArticle(slug), getArticles(), getSettings()]);
  if (!article) notFound();

  const related = all.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);
  const fallbackRelated = related.length
    ? related
    : all.filter((a) => a.id !== article.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? article.seo_description,
    image: article.cover_image_url ? [article.cover_image_url] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { "@type": "Organization", name: article.author_name ?? settings.store_name },
    publisher: {
      "@type": "Organization",
      name: settings.store_name,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}/artikel/${article.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        <header className="border-b border-slate-100 bg-ice/60">
          <div className="container-page max-w-3xl py-10 sm:py-14">
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-slate-500">
              <Link href="/" className="hover:text-navy">
                Beranda
              </Link>
              <ChevronRight className="size-3" />
              <Link href="/artikel" className="hover:text-navy">
                Artikel
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-navy">{ARTICLE_CATEGORY_LABELS[article.category]}</span>
            </nav>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">{ARTICLE_CATEGORY_LABELS[article.category]}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl lg:text-[2.75rem]">
              {article.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <time dateTime={article.published_at}>{formatDateLong(article.published_at)}</time>
              {article.author_name && (
                <>
                  <span aria-hidden>·</span>
                  <span>{article.author_name}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {article.cover_image_url && (
          <div className="container-page max-w-4xl pt-8 sm:pt-10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-50 shadow-sm">
              <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                priority
                sizes="(min-width: 896px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="container-page max-w-3xl py-10 sm:py-14">
          {article.excerpt && <p className="text-lg leading-relaxed text-slate-600 sm:text-xl">{article.excerpt}</p>}
          <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-slate-700 sm:text-[17px]">{article.body}</div>
          <p className="mt-10">
            <Link href="/artikel" className="text-sm font-bold text-brand-600 hover:text-brand-700">
              ← Semua artikel
            </Link>
          </p>
        </div>
      </article>

      {fallbackRelated.length > 0 && (
        <section className="border-t border-slate-100 bg-ice py-14 sm:py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Baca juga" title="Artikel terkait" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fallbackRelated.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ClosingCta settings={settings} />
    </>
  );
}

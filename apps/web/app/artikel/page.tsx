import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { PageHero } from "@/components/page-hero";
import { getArticles } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Artikel & Berita",
  description: "Berita lapak, resep masak seafood, dan tips menyimpan hasil laut dari Syauqi Fresh Seafood Muara Angke.",
};

export default async function ArtikelPage() {
  const articles = await getArticles();

  return (
    <>
      <PageHero
        crumbs={[{ label: "Artikel & Berita" }]}
        title="Artikel, resep & tips seafood"
        description="Berita dari lapak, ide masak praktis, dan panduan menjaga kesegaran hasil laut."
      />
      <section className="container-page py-12 sm:py-16">
        {articles.length === 0 ? (
          <p className="rounded-2xl bg-ice px-6 py-12 text-center text-slate-500">Belum ada artikel. Cek lagi nanti ya.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} priority={i < 3} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

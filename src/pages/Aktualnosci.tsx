import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ParallaxImage } from "../components/ui/ParallaxImage";
import { Reveal } from "../components/ui/Reveal";
import { formatPostDate, posts } from "../data/news";
import { pageSeo } from "../data/pages";
import { pageHeroes } from "../data/subpages";
import { SIZES_GRID } from "../lib/responsiveImage";

export function Aktualnosci() {
  const seo = pageSeo("aktualnosci");
  const hero = pageHeroes.aktualnosci;

  return (
    <>
      {/* Pusta lista nie ma czego wnieść do wyników wyszukiwania. */}
      <Seo title={seo.title} description={seo.description} canonicalPath="/aktualnosci" noindex={posts.length === 0} />
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />

      <section className="bg-limestone py-16 text-void md:py-24">
        <div className="container-edge">
          {posts.length === 0 ? (
            <p className="max-w-xl text-lg leading-relaxed text-void/65">Pierwsze wpisy pojawią się wkrótce.</p>
          ) : (
            /* Ten sam format kafla co w realizacjach: jedna proporcja, trzy
               kolumny od `lg`. Wpis bez zdjęcia dostaje ciemne pole z datą,
               żeby siatka nie miała dziur. */
            <ul className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <li key={post.slug}>
                  <Reveal delay={(i % 3) * 0.06}>
                    <Link to={`/aktualnosci/${post.slug}`} className="group block">
                      <div className="relative aspect-[16/10] overflow-hidden bg-void">
                        {post.cover ? (
                          <ParallaxImage
                            src={post.cover}
                            alt=""
                            sizes={SIZES_GRID}
                            className="h-full w-full"
                            imgClassName="transition-transform duration-[900ms] ease-[var(--ease-premium)] group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="grain blueprint-grid absolute inset-0 opacity-60" aria-hidden />
                        )}
                      </div>
                      <p className="label mt-6 text-bronze">{formatPostDate(post.date)}</p>
                      <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] transition-colors group-hover:text-bronze">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-void/65">{post.excerpt}</p>
                      )}
                      <span className="mt-5 inline-flex items-center gap-2 label text-void">
                        Czytaj
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          strokeWidth={1.5}
                        />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

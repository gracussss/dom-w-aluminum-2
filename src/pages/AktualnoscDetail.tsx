import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Seo } from "../components/Seo";
import { RevealText } from "../components/ui/Reveal";
import { NotFound } from "./NotFound";
import { formatPostDate, posts } from "../data/news";
import type { NewsPost } from "../data/news";
import { articleJsonLd, breadcrumbJsonLd } from "../lib/jsonLd";
import { renderMarkdown } from "../lib/markdown";
import { SIZES_FULL, responsiveSrcSet } from "../lib/responsiveImage";
import { siteOrigin } from "../lib/seo";

export function AktualnoscDetail() {
  const { slug } = useParams();
  const index = posts.findIndex((p) => p.slug === slug);
  const post = index >= 0 ? posts[index] : undefined;

  if (!post) return <NotFound />;

  /* Starszy wpis pod spodem — przy jednym wpisie nie ma dokąd iść. */
  const older = posts[index + 1];
  const path = `/aktualnosci/${post.slug}`;
  const crumbs = [{ label: "Aktualności", to: "/aktualnosci" }, { label: post.title }];

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt || post.title}
        canonicalPath={path}
        image={post.cover || undefined}
        imageAlt={post.title}
        jsonLd={[articleJsonLd({ ...post, path }), breadcrumbJsonLd(crumbs, siteOrigin())]}
      />
      <ArticleView post={post} />

      {older && (
        <section className="border-t border-void/10 bg-limestone text-void">
          <Link
            to={`/aktualnosci/${older.slug}`}
            className="container-edge group flex items-center justify-between gap-6 py-12 md:py-16"
          >
            <div>
              <span className="label text-void/55">Starszy wpis</span>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-bronze md:text-3xl">
                {older.title}
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 transition-transform duration-500 group-hover:translate-x-1.5"
              strokeWidth={1.4}
            />
          </Link>
        </section>
      )}
    </>
  );
}

/** Treść wpisu bez meta — tę samą część rysuje podgląd na żywo w panelu. */
export function ArticleView({ post }: { post: NewsPost }) {
  const html = useMemo(() => renderMarkdown(post.body), [post.body]);

  return (
    <article>
      <header className="relative flex min-h-[56svh] items-end overflow-hidden bg-void text-limestone">
        {post.cover ? (
          <>
            <img
              src={post.cover}
              srcSet={responsiveSrcSet(post.cover)}
              sizes={SIZES_FULL}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-void/40" />
          </>
        ) : (
          <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden />
        )}
        <div className="grain absolute inset-0" />

        <div className="container-edge relative pb-14 pt-36 md:pb-20">
          <Link
            to="/aktualnosci"
            className="label inline-flex items-center gap-2 text-limestone/55 transition-colors hover:text-limestone"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Aktualności
          </Link>
          {post.date && (
            <p className="label mt-8 text-bronze-light">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </p>
          )}
          <h1 className="display display-tight mt-4 max-w-4xl text-balance text-[10vw] leading-[0.98] sm:text-5xl md:text-6xl">
            <RevealText>{post.title}</RevealText>
          </h1>
        </div>
      </header>

      <div className="bg-limestone py-16 text-void md:py-24">
        <div className="container-edge">
          {post.excerpt && (
            <p className="max-w-2xl text-pretty text-xl leading-relaxed text-void/80 md:text-2xl">{post.excerpt}</p>
          )}
          {/* HTML z Markdownu po sanityzacji w renderMarkdown (bez surowego
              HTML-a i bez linków `javascript:`) — patrz src/lib/markdown.ts. */}
          <div
            className={`article-body max-w-2xl ${post.excerpt ? "mt-10" : ""}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </article>
  );
}

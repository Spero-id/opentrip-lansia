"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Newspaper, ArrowRight } from "lucide-react";
import Subs from "@/features/newsletter/components/Subs";
import { fetchBlogCategories, fetchPublishedBlogs, formatBlogDate } from "@/features/blog/api/client";
import type { BlogCategory, BlogPost } from "@/features/blog/types";

function BlogListContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(searchParams.get("category"));

  useEffect(() => {
    let cancelled = false;
    fetchPublishedBlogs().then((data) => {
      if (!cancelled) setPosts(data);
    });
    fetchBlogCategories().then((data) => {
      if (!cancelled) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const nameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const usedSlugs = useMemo(() => {
    const ids = new Set((posts ?? []).map((p) => p.categoryId).filter(Boolean) as string[]);
    return categories.filter((c) => ids.has(c.id));
  }, [categories, posts]);

  const visible = useMemo(() => {
    if (!posts) return null;
    if (!activeSlug) return posts;
    const cat = categories.find((c) => c.slug === activeSlug);
    if (!cat) return posts;
    return posts.filter((p) => p.categoryId === cat.id);
  }, [posts, activeSlug, categories]);

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight text-foreground">
              Berita &amp; <span className="text-primary-foreground">Artikel</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Info terbaru seputar open trip, destinasi, dan layanan kami.
            </p>
            {usedSlugs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setActiveSlug(null)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${activeSlug === null ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:border-primary"}`}
                >
                  Semua
                </button>
                {usedSlugs.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveSlug(activeSlug === c.slug ? null : c.slug)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${activeSlug === c.slug ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:border-primary"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {visible === null ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              Memuat artikel...
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 px-4 text-center bg-card">
              <p className="text-sm font-bold text-foreground">Belum ada artikel</p>
              <p className="text-xs text-muted-foreground mt-1">
                Nantikan berita dan artikel terbaru dari kami.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visible.map((post) => {
                const categoryName = post.categoryId ? nameById.get(post.categoryId) : undefined;
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-xl border border-border bg-card shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-primary-foreground/40">
                          <Newspaper className="h-10 w-10" />
                        </div>
                      )}
                      {categoryName && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-primary-foreground bg-primary shadow-xs">
                          {categoryName}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-[11px] font-semibold text-primary-foreground uppercase tracking-wider mb-1.5">
                        {formatBlogDate(post.publishedAt || post.createdAt)}
                      </div>
                      <h2 className="font-bold text-foreground leading-snug transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-foreground mt-3">
                        Baca Selengkapnya
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Subs />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogListContent />
    </Suspense>
  );
}

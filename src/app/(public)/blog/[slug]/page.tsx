"use client";

import { Suspense, use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Subs from "@/features/newsletter/components/Subs";
import { sanitizeBlogContent } from "@/lib/html/sanitize";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { fetchBlogCategories, fetchPostBySlug, formatBlogDate } from "@/features/blog/api/client";
import type { BlogCategory, BlogPost } from "@/features/blog/types";

type BlogDetailStatus = "loading" | "found" | "notfound";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [status, setStatus] = useState<BlogDetailStatus>("loading");

  useEffect(() => {
    const slug = resolvedParams.slug;
    let cancelled = false;
    fetchPostBySlug(slug)
      .then((found) => {
        if (cancelled) return;
        setPost(found);
        setStatus(found ? "found" : "notfound");
        if (found?.categoryId) {
          fetchBlogCategories().then((cats) => {
            if (cancelled) return;
            setCategory(cats.find((c) => c.id === found.categoryId) ?? null);
          });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("notfound");
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.slug]);

  if (status === "notfound") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {status !== "found" || !post ? (
        <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">
          Memuat artikel...
        </div>
      ) : (
        <main className="min-h-screen bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Blog
            </Link>

            <div className="mt-6">
              <div className="text-xs font-semibold text-primary-foreground uppercase tracking-wider mb-3">
                {formatBlogDate(post.publishedAt || post.createdAt)}
                {category && (
                  <>
                    {" · "}
                    <Link href={`/blog?category=${category.slug}`} className="hover:underline">
                      {category.name}
                    </Link>
                  </>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-foreground">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="mt-6 w-full rounded-xl object-cover"
                />
              )}
            </div>

            <div className="mt-8 border-t border-border pt-8">
              <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Memuat konten...</div>}>
                <ErrorBoundary>
                  <div
                    className="text-sm text-muted-foreground leading-7 prose prose-slate max-w-none [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold"
                    dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(post.content) || "Konten artikel belum tersedia." }}
                  />
                </ErrorBoundary>
              </Suspense>
            </div>
          </div>
        </main>
      )}
      <Subs />
    </div>
  );
}

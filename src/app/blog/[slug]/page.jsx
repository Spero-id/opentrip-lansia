"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Subs from "@/components/landing/Subs";
import { sanitizeBlogContent } from "@/shared/utils/sanitize";

const dateLabel = (dateStr) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function BlogDetailPage({ params }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const slug = resolvedParams.slug;
    let cancelled = false;

    fetch("/api/blogs?published=1")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data)) {
          setStatus("notfound");
          return;
        }
        const found = data.find((b) => b.slug === slug);
        setPost(found ?? null);
        setStatus(found ? "found" : "notfound");
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {status !== "found" || !post ? (
        <div className="flex items-center justify-center min-h-[60vh] text-sm text-[#6B7280]">
          Memuat artikel...
        </div>
      ) : (
        <main className="min-h-screen bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#F49D1A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Blog
            </Link>

            <div className="mt-6">
              <div className="text-xs font-semibold text-[#F49D1A] uppercase tracking-wider mb-3">
                {dateLabel(post.publishedAt || post.createdAt)}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-[#1F2937]">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-sm sm:text-base text-[#6B7280] mt-4 leading-relaxed">
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

          {post.coverImage && (
            <div className="mt-8 rounded-2xl overflow-hidden shadow-md">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-8">
            <div
              className="text-sm text-gray-700 leading-7 prose prose-slate max-w-none [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold"
              dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(post.content) || "Konten artikel belum tersedia." }}
            />
          </div>
        </main>
      )}
      <Subs />
      <Footer />
    </div>
  );
}

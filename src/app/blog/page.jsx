"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Subs from "@/components/landing/Subs";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";

const dateLabel = (dateStr) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function BlogPage() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blogs?published=1")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="min-h-screen bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight text-[#1F2937]">
              Berita &amp; <span className="text-[#F49D1A]">Artikel</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] mt-2">
              Info terbaru seputar open trip, destinasi, dan layanan kami.
            </p>
          </div>

          {posts === null ? (
            <div className="text-center py-16 text-sm text-[#6B7280]">
              Memuat artikel...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 px-4 text-center bg-white">
              <p className="text-sm font-bold text-[#1F2937]">Belum ada artikel</p>
              <p className="text-xs text-[#6B7280] mt-1">
                Nantikan berita dan artikel terbaru dari kami.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F9FAFB]">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F49D1A]/10 to-[#1CA6B7]/10 text-[#F49D1A]/40">
                        <Newspaper className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                  <div className="text-[11px] font-semibold text-[#F49D1A] uppercase tracking-wider mb-1.5">
                    {dateLabel(post.publishedAt || post.createdAt)}
                  </div>
                  <h2 className="font-bold text-[#1F2937] leading-snug transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-xs text-[#6B7280] leading-relaxed mt-1.5 mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F49D1A] mt-3">
                    Baca Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Subs />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

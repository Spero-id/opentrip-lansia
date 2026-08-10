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
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mb-8 sm:mb-12">

          <h1 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight">
            Berita &amp; Artikel
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Info terbaru seputar open trip, destinasi, dan layanan kami.
          </p>
        </div>

        {posts === null ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Memuat artikel...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 py-16 px-4 text-center bg-gray-50/50">
            <p className="text-sm font-bold text-gray-800">Belum ada artikel</p>
            <p className="text-xs text-gray-400 mt-1">
              Nantikan berita dan artikel terbaru dari kami.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-[#F49D1A]/30 transition-all p-6 flex flex-col"
              >
                <div className="text-[11px] font-semibold text-[#F49D1A] uppercase tracking-wider mb-2">
                  {dateLabel(post.publishedAt || post.createdAt)}
                </div>
                <h2 className="font-bold text-gray-900 leading-snug group-hover:text-[#F49D1A] transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F49D1A] mt-4">
                  Baca Selengkapnya
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
        <Subs />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

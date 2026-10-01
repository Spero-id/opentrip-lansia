import type { Metadata } from "next";
import type { ReactNode } from "react";
import { blogRepository } from "@/features/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await blogRepository.findBySlug(slug);
    if (!post) return { title: "Artikel Tidak Ditemukan" };
    return {
      title: post.title,
      description: post.excerpt || undefined,
    };
  } catch {
    return { title: "Blog Open Trip Lansia" };
  }
}

export default function BlogDetailLayout({ children }: { children: ReactNode }) {
  return children;
}

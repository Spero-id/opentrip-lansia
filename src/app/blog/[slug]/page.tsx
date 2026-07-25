import { notFound } from "next/navigation";
import { db } from "@/db";
import { blogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
  if (!blog) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      <p className="mt-2 text-sm text-gray-500">{blog.publishedAt?.toLocaleDateString("id-ID")}</p>
      <div className="mt-8 whitespace-pre-wrap text-gray-700 leading-relaxed">{blog.content}</div>
    </article>
  );
}

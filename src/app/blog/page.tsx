import Link from "next/link";
import { db } from "@/db";
import { blogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function BlogList() {
  const rows = await db
    .select()
    .from(blogs)
    .where(eq(blogs.status, "published"))
    .orderBy(desc(blogs.publishedAt))
    .limit(20);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Blog</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {rows.map((b) => (
          <Link key={b.id} href={`/blog/${b.slug}`} className="rounded-xl border p-5 transition hover:shadow-md">
            <h3 className="font-semibold">{b.title}</h3>
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{b.excerpt}</p>
            <p className="mt-3 text-xs text-gray-400">{b.publishedAt?.toLocaleDateString("id-ID")}</p>
          </Link>
        ))}
        {rows.length === 0 && <p className="text-gray-400">Belum ada artikel.</p>}
      </div>
    </div>
  );
}

import { describe, expect, it, vi, afterEach } from "vitest";
import {
  fetchPostBySlug,
  fetchPublishedBlogs,
  findPostBySlug,
  formatBlogDate,
} from "@/features/blog/api/client";
import type { BlogPost } from "@/features/blog/types";

afterEach(() => {
  vi.unstubAllGlobals();
});

const POSTS: BlogPost[] = [
  { id: "1", slug: "tips-lansia", title: "Tips", excerpt: "ex" },
  { id: "2", slug: "wisata-bali", title: "Bali" },
];

describe("findPostBySlug", () => {
  it("finds post by exact slug", () => {
    expect(findPostBySlug(POSTS, "wisata-bali")?.id).toBe("2");
  });

  it("returns null for unknown slug", () => {
    expect(findPostBySlug(POSTS, "tak-ada")).toBeNull();
  });
});

describe("formatBlogDate", () => {
  it("formats id-ID date", () => {
    expect(formatBlogDate("2026-01-15")).toContain("2026");
  });

  it("returns empty string for missing date", () => {
    expect(formatBlogDate(null)).toBe("");
    expect(formatBlogDate(undefined)).toBe("");
  });
});

describe("fetchPublishedBlogs", () => {
  it("returns array payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve(POSTS) }));
    await expect(fetchPublishedBlogs()).resolves.toEqual(POSTS);
  });

  it("returns empty list for non-array payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve({ error: "x" }) }));
    await expect(fetchPublishedBlogs()).resolves.toEqual([]);
  });

  it("returns empty list on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(fetchPublishedBlogs()).resolves.toEqual([]);
  });
});

describe("fetchPostBySlug", () => {
  it("resolves post from list", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve(POSTS) }));
    await expect(fetchPostBySlug("tips-lansia")).resolves.toEqual(POSTS[0]);
  });

  it("resolves null when missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve(POSTS) }));
    await expect(fetchPostBySlug("tak-ada")).resolves.toBeNull();
  });
});

describe("fetchBlogCategories", () => {
  it("returns array payload", async () => {
    const { fetchBlogCategories } = await import("@/features/blog/api/client");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve([{ id: "c1", name: "Tips", slug: "tips" }]) }));
    await expect(fetchBlogCategories()).resolves.toEqual([{ id: "c1", name: "Tips", slug: "tips" }]);
  });

  it("returns empty list on failure", async () => {
    const { fetchBlogCategories } = await import("@/features/blog/api/client");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(fetchBlogCategories()).resolves.toEqual([]);
  });
});

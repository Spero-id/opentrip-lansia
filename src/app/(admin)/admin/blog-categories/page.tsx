"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export default function AdminBlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/blog-categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initial() {
      await load();
    }
    void initial();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Gagal menambah kategori");
        return;
      }
      const created = await res.json();
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch {
      setError("Gagal menambah kategori");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/blog-categories/${id}`, { method: "DELETE" });
      if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Kategori Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola daftar kategori artikel publik.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-3 bg-card p-4 rounded-3xl border border-border/80 shadow-xs">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori baru..."
          className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          type="submit"
          disabled={saving || !newName.trim()}
          className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition disabled:opacity-50 inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </form>

      {error && (
        <p className="text-xs font-semibold text-destructive-600 bg-destructive-50 border border-destructive-100 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">Memuat kategori...</p>
        ) : categories.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">Belum ada kategori.</p>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">/{c.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-muted-foreground hover:text-destructive-600 hover:bg-destructive-50 rounded-xl transition"
                  title={`Hapus kategori ${c.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">Artikel yang kategorinya dihapus otomatis menjadi tanpa kategori.</p>
    </div>
  );
}

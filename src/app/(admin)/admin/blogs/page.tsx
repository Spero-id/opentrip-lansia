"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import Modal from "@/app/(admin)/admin/components/modal";
import ConfirmDelete from "@/app/(admin)/admin/components/confirm-delete";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import WysiwygEditor from "@/features/blog/components/wysiwyg-editor";
import BlogCoverUploader from "@/app/(admin)/admin/components/blog-cover-uploader";
import { useAdminCrud } from "@/features/admin";
import { slugify } from "@/utils/helpers";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  coverImage?: string | null;
  status: string;
  categoryId?: string | null;
  categoryName?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  status: string;
  categoryId: string;
}

const emptyForm: BlogForm = { title: "", slug: "", content: "", excerpt: "", coverImage: "", status: "draft", categoryId: "" };



export default function AdminBlogs() {
  const {
    rows,
    loading,
    modalOpen,
    editing,
    form,
    saving,
    saveError,
    deletingId,
    openCreate,
    openEdit,
    closeModal,
    setForm,
    submit,
    confirmDelete,
    cancelDelete,
    executeDelete,
  } = useAdminCrud<Blog, BlogForm>({
    endpoint: "/api/blogs",
    emptyForm,
    toForm: (item) => ({
      title: item.title,
      slug: item.slug,
      content: item.content || "",
      excerpt: item.excerpt || "",
      coverImage: item.coverImage || "",
      status: item.status,
      categoryId: item.categoryId || "",
    }),
  });

  const [categories, setCategories] = useState<BlogCategory[]>([]);

  useEffect(() => {
    fetch("/api/blog-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  async function handleCreateCategory(inputValue: string) {
    const res = await fetch("/api/blog-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: inputValue }),
    });
    if (res.ok) {
      const created = await res.json();
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((prev) => ({ ...prev, categoryId: created.id }));
    }
  }

  async function handleDeleteCategory(id: string) {
    const res = await fetch(`/api/blog-categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  function categoryNameOf(id?: string | null): string | null {
    if (!id) return null;
    return categories.find((c) => c.id === id)?.name ?? null;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "title" && !prev.slug.trim()) {
        return { ...prev, title: value, slug: slugify(value) };
      }
      return { ...prev, [name]: value };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Blog</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola artikel blog dan konten publikasi.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Blog</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Sampul</th>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Belum ada data blog.</td></tr>
              ) : (
                rows.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      {b.coverImage ? (
                        <img src={b.coverImage} alt="" className="w-16 h-12 object-cover rounded-lg border border-slate-200" />
                      ) : (
                        <div className="w-16 h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-300">-
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{b.title}</td>
                    <td className="px-6 py-4">
                      {categoryNameOf(b.categoryId) ? (
                        <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-[#F49D1A]/10 text-[#F49D1A]">{categoryNameOf(b.categoryId)}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${b.status === "published" ? "bg-[#1CA6B7]/15 text-[#1CA6B7]" : "bg-slate-100 text-slate-600"}`}>{b.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{b.createdAt ? new Date(b.createdAt).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(b)} className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition" title="Edit Blog">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(b.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Blog" : "Tambah Blog"} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Judul</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Ringkasan (Excerpt)</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <CreatableSelect
              isClearable
              placeholder="Pilih atau ketik kategori baru..."
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={categories.map((c) => ({ value: c.id, label: c.name })).find((c) => c.value === form.categoryId) || null}
              onChange={(selected) => setForm((prev) => ({ ...prev, categoryId: selected ? (selected as { value: string }).value : "" }))}
              onCreateOption={handleCreateCategory}
              formatCreateLabel={(inputValue) => `+ Buat kategori "${inputValue}"`}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konten</label>
            <ErrorBoundary>
              <WysiwygEditor
                value={form.content}
                onChange={(content) => setForm((prev) => ({ ...prev, content }))}
              />
            </ErrorBoundary>
          </div>
          <div>
            <BlogCoverUploader
              value={form.coverImage || null}
              onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url || "" }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          {saveError && (
            <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-[#F49D1A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" onClick={closeModal}
              className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
              Batal
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete open={deletingId !== null} onClose={cancelDelete} onConfirm={executeDelete} />
    </div>
  );
}

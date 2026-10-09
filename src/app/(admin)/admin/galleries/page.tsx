"use client";

import { Plus, Edit, Trash2 } from "lucide-react";
import Modal from "@/app/(admin)/admin/components/modal";
import ConfirmDelete from "@/app/(admin)/admin/components/confirm-delete";
import { useAdminCrud } from "@/features/admin";

interface Gallery {
  id: string;
  tripId: string;
  title: string | null;
  description: string | null;
  isPrivate: boolean;
  createdAt: string;
}

interface GalleryForm {
  tripId: string;
  title: string;
  description: string;
  isPrivate: boolean;
}

const emptyForm: GalleryForm = { tripId: "", title: "", description: "", isPrivate: false };

export default function AdminGalleries() {
  const {
    rows,
    loading,
    modalOpen,
    editing,
    form,
    saving,
    deletingId,
    openCreate,
    openEdit,
    closeModal,
    setForm,
    submit,
    confirmDelete,
    cancelDelete,
    executeDelete,
  } = useAdminCrud<Gallery, GalleryForm>({
    endpoint: "/api/galleries",
    emptyForm,
    toForm: (item) => ({
      tripId: item.tripId,
      title: item.title || "",
      description: item.description || "",
      isPrivate: item.isPrivate,
    }),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Manajemen Galeri</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola galeri foto dan video per paket trip.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Galeri</span>
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Trip ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Belum ada data galeri.</td></tr>
              ) : (
                rows.map((g) => (
                  <tr key={g.id} className="hover:bg-muted/60 transition">
                    <td className="px-6 py-4 font-bold text-foreground">{g.title || "(tanpa judul)"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{g.tripId.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${g.isPrivate ? "bg-warning-100 text-warning-700" : "bg-secondary/15 text-secondary-foreground"}`}>
                        {g.isPrivate ? "Private" : "Public"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{g.createdAt ? new Date(g.createdAt).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(g)} className="p-2 text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 rounded-xl transition" title="Edit Galeri">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(g.id)} className="p-2 text-muted-foreground hover:text-destructive-600 hover:bg-destructive-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Galeri" : "Tambah Galeri"} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Trip ID</label>
            <input name="tripId" value={form.tripId} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Judul</label>
            <input name="title" value={form.title} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input name="isPrivate" type="checkbox" checked={form.isPrivate} onChange={handleChange}
              className="w-4 h-4 rounded border-border text-primary-foreground focus:ring-primary/30" />
            <span className="font-medium text-foreground">Galeri Private</span>
          </label>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" onClick={closeModal}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition">
              Batal
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete open={deletingId !== null} onClose={cancelDelete} onConfirm={executeDelete} />
    </div>
  );
}

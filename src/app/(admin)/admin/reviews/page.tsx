"use client";

import { Edit, Trash2, Star, User, Calendar, Hash } from "lucide-react";
import Modal from "@/app/(admin)/admin/components/modal";
import ConfirmDelete from "@/app/(admin)/admin/components/confirm-delete";
import { useAdminCrud } from "@/features/admin";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  status: string;
  isFeatured: boolean;
  bookingId: string;
  tripId: string;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
  tripTitle?: string | null;
  groupStartDate?: string | null;
  groupEndDate?: string | null;
  bookingCode?: string | null;
}

interface ReviewForm {
  status: string;
  isFeatured: boolean;
}

const emptyForm: ReviewForm = { status: "pending", isFeatured: false };

export default function AdminReviews() {
  const {
    rows,
    loading,
    modalOpen,
    editing,
    form,
    saving,
    deletingId,
    openEdit,
    closeModal,
    setForm,
    submit,
    confirmDelete,
    cancelDelete,
    executeDelete,
  } = useAdminCrud<Review, ReviewForm>({
    endpoint: "/api/reviews",
    emptyForm,
    toForm: (item) => ({ status: item.status, isFeatured: item.isFeatured }),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await submit(e);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  const statusStyles: Record<string, string> = {
    approved: "bg-[#1CA6B7]/15 text-[#1CA6B7]",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Ulasan</h1>
          <p className="text-sm text-slate-500 mt-1">Moderasi ulasan dan rating dari pengguna.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-4">Pengguna</th>
                <th className="px-4 py-4">Trip & Grup</th>
                <th className="px-4 py-4">Rating</th>
                <th className="px-4 py-4">Ulasan</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Belum ada data ulasan.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1CA6B7]/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-[#1CA6B7]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{r.userName || "-"}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{r.userEmail || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">{r.tripTitle || "-"}</p>
                        {r.groupStartDate && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {r.groupStartDate}
                            {r.groupEndDate ? ` - ${r.groupEndDate}` : ""}
                          </div>
                        )}
                        {r.bookingCode && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Hash className="w-3 h-3" />
                            {r.bookingCode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                        {r.rating}/5 <Star className="w-3 h-3 fill-amber-500" />
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-600 max-w-[200px] truncate">{r.content || "-"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[r.status] || "bg-slate-100 text-slate-600"}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(r)} className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition" title="Edit Ulasan">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(r.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={closeModal} title="Edit Ulasan" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30" />
            <span className="font-medium text-slate-700">Featured Review</span>
          </label>
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

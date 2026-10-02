"use client";

import { Plus, Edit, Trash2, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import Modal from "@/app/(admin)/admin/components/modal";
import ConfirmDelete from "@/app/(admin)/admin/components/confirm-delete";
import { useAdminCrud } from "@/features/admin";

interface MeetingPoint {
  id: string;
  name: string;
  address: string | null;
  geoPoint: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

interface MeetingPointForm {
  name: string;
  address: string;
  description: string;
  isActive: boolean;
}

const emptyForm: MeetingPointForm = { name: "", address: "", description: "", isActive: true };

export default function AdminMeetingPoints() {
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
  } = useAdminCrud<MeetingPoint, MeetingPointForm>({
    endpoint: "/api/meeting-points",
    emptyForm,
    toForm: (item) => ({
      name: item.name,
      address: item.address || "",
      description: item.description || "",
      isActive: item.isActive,
    }),
    transform: (current) => ({
      name: current.name,
      address: current.address || null,
      description: current.description || null,
      isActive: current.isActive,
    }),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Meeting Point</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola titik kumpul penjemputan peserta sebelum keberangkatan trip.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Meeting Point</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada data meeting point.</td></tr>
              ) : (
                rows.map((mp) => (
                  <tr key={mp.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#F49D1A]/15 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-[#F49D1A]" />
                        </div>
                        <span className="font-bold text-slate-900">{mp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{mp.address || "-"}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{mp.description || "-"}</td>
                    <td className="px-6 py-4">
                      {mp.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-[#1CA6B7]/15 text-[#1CA6B7] px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <XCircle className="w-3 h-3" /> Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(mp)} className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(mp.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Meeting Point" : "Tambah Meeting Point"} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nama Meeting Point *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              placeholder="Contoh: Bandara Soekarno-Hatta, Stasiun Bandung"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Alamat / Lokasi</label>
            <input name="address" value={form.address} onChange={handleChange}
              placeholder="Contoh: Terminal 3, Soekarno-Hatta, Tangerang"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Contoh: Titik kumpul di depan pintu kedatangan. Silakan hadir 15 menit sebelum waktu kumpul."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] resize-none" />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30" />
            <span className="font-medium text-slate-700">Aktif</span>
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

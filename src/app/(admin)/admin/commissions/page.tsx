"use client";

import { Plus, Edit, Trash2 } from "lucide-react";
import Modal from "@/app/(admin)/admin/components/modal";
import ConfirmDelete from "@/app/(admin)/admin/components/confirm-delete";
import { useAdminCrud } from "@/features/admin";

interface Commission {
  id: string;
  agentId: string;
  bookingId: string;
  amount: string;
  status: string;
  createdAt: string;
}

interface CommissionForm {
  agentId: string;
  bookingId: string;
  amount: string;
  status: string;
}

const emptyForm: CommissionForm = { agentId: "", bookingId: "", amount: "", status: "pending" };

export default function AdminCommissions() {
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
  } = useAdminCrud<Commission, CommissionForm>({
    endpoint: "/api/commissions",
    emptyForm,
    toForm: (item) => ({ agentId: item.agentId, bookingId: item.bookingId, amount: item.amount, status: item.status }),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const statusStyles: Record<string, string> = {
    paid: "bg-secondary/15 text-secondary-foreground",
    approved: "bg-info-100 text-info-700",
    pending: "bg-warning-100 text-warning-700",
    rejected: "bg-destructive-100 text-destructive-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Manajemen Komisi Agen</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola komisi agen, approval, dan pencairan dana.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Komisi</span>
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-6 py-4">Agen</th>
                <th className="px-6 py-4">Booking</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Belum ada data komisi.</td></tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/60 transition">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.agentId.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.bookingId.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-bold text-foreground">Rp {parseInt(c.amount).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[c.status] || "bg-muted text-muted-foreground"}`}>{c.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-2 text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 rounded-xl transition" title="Edit Komisi">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(c.id)} className="p-2 text-muted-foreground hover:text-destructive-600 hover:bg-destructive-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Komisi" : "Tambah Komisi"}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">ID Agen</label>
            <input name="agentId" value={form.agentId} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">ID Booking</label>
            <input name="bookingId" value={form.bookingId} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Jumlah (Rp)</label>
            <input name="amount" value={form.amount} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
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

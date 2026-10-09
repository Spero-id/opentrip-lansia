"use client";

import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import Modal from "@/app/(admin)/admin/components/modal";
import ConfirmDelete from "@/app/(admin)/admin/components/confirm-delete";
import { useAdminCrud } from "@/features/admin";
import { parseMoney, parsePromoValue } from "@/features/promotion/promo-value";

interface Promotion {
  id: string;
  code: string;
  title: string | null;
  type: string;
  value: string;
  minPurchase: string | null;
  maxDiscount: string | null;
  usageCount: number;
  usageLimit: number | null;
  isActive: boolean;
  createdAt: string;
}

interface PromotionForm {
  code: string;
  title: string;
  type: string;
  value: string;
  minPurchase: string;
  maxDiscount: string;
  usageLimit: number | null;
  isActive: boolean;
}

const emptyForm: PromotionForm = { code: "", title: "", type: "percentage", value: "", minPurchase: "", maxDiscount: "", usageLimit: null, isActive: true };

export default function AdminPromotions() {
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
  } = useAdminCrud<Promotion, PromotionForm>({
    endpoint: "/api/promotions",
    emptyForm,
    toForm: (item) => ({
      code: item.code,
      title: item.title || "",
      type: item.type,
      value: item.value,
      minPurchase: item.minPurchase || "",
      maxDiscount: item.maxDiscount || "",
      usageLimit: item.usageLimit,
      isActive: item.isActive,
    }),
    validate: (current) => {
      const value = parsePromoValue(String(current.value).trim(), current.type);
      if (value <= 0) {
        return current.type === "percentage"
          ? "Nilai diskon persentase tidak valid (contoh: 20 atau 20%)."
          : "Nilai diskon nominal tidak valid (contoh: 100000).";
      }
      if (current.type === "percentage" && value > 100) {
        return "Persentase diskon tidak boleh lebih dari 100.";
      }
      if (current.minPurchase && parseMoney(current.minPurchase) <= 0) {
        return "Min. Pembelian tidak valid (contoh: 100000). ";
      }
      if (current.maxDiscount && parseMoney(current.maxDiscount) <= 0) {
        return "Maks. Diskon tidak valid (contoh: 100000).";
      }
      return null;
    },
    transform: (current) => ({
      ...current,
      code: current.code.trim().toUpperCase(),
      value: String(current.value).trim(),
      minPurchase: current.minPurchase.trim(),
      maxDiscount: current.maxDiscount.trim(),
    }),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const finalValue = name === "code" ? String(value).toUpperCase() : type === "checkbox" ? checked : value;
    setForm(prev => ({ ...prev, [name]: finalValue }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Manajemen Kode Promo</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola kupon diskon dan potongan harga untuk pengguna Jelajah Memoria.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Promo</span>
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-6 py-4">Kode Kupon</th>
                <th className="px-6 py-4">Tipe Diskon</th>
                <th className="px-6 py-4">Nilai Diskon</th>
                <th className="px-6 py-4">Batas Pemakaian</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Belum ada data promo.</td></tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-primary-foreground">{p.code}</td>
                    <td className="px-6 py-4 text-muted-foreground font-medium capitalize">{p.type}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{p.value}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.usageCount} / {p.usageLimit || "∞"}</td>
                    <td className="px-6 py-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-secondary/15 text-secondary-foreground px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <XCircle className="w-3 h-3" /> Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 rounded-xl transition" title="Edit Promo">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive-600 hover:bg-destructive-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Promo" : "Tambah Promo"} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Kode Kupon</label>
              <input name="code" value={form.code} onChange={handleChange} required
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Tipe Diskon</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="percentage">Persentase</option>
                <option value="nominal">Nominal</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Nilai Diskon</label>
              <input name="value" value={form.value} onChange={handleChange} required
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder={form.type === "percentage" ? "20 atau 20%" : "100000"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Judul Promo</label>
              <input name="title" value={form.title} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Min. Pembelian</label>
              <input name="minPurchase" value={form.minPurchase} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Maks. Diskon</label>
              <input name="maxDiscount" value={form.maxDiscount} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Batas Pemakaian</label>
              <input name="usageLimit" type="number" value={form.usageLimit ?? ""} onChange={e => setForm(prev => ({ ...prev, usageLimit: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" min={0} />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
              className="w-4 h-4 rounded border-border text-primary-foreground focus:ring-primary/30" />
            <span className="font-medium text-foreground">Aktif</span>
          </label>
          {saveError && (
            <p className="text-xs font-semibold text-destructive-600 bg-destructive-50 border border-destructive-100 rounded-xl px-3 py-2">{saveError}</p>
          )}
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

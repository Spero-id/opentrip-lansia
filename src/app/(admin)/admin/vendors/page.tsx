"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Modal from "@/app/(admin)/admin/components/modal";
import ConfirmDelete from "@/app/(admin)/admin/components/confirm-delete";
import { useAdminCrud } from "@/features/admin";

interface Vendor {
  id: string;
  typeId: string | null;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  serviceArea: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface VendorForm {
  typeId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  serviceArea: string;
  isVerified: boolean;
  isActive: boolean;
}

const emptyForm: VendorForm = { typeId: "", name: "", contactPerson: "", phone: "", email: "", serviceArea: "", isVerified: false, isActive: true };

export default function AdminVendors() {
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
  } = useAdminCrud<Vendor, VendorForm>({
    endpoint: "/api/vendors",
    emptyForm,
    toForm: (item) => ({
      typeId: item.typeId || "",
      name: item.name,
      contactPerson: item.contactPerson || "",
      phone: item.phone || "",
      email: item.email || "",
      serviceArea: item.serviceArea || "",
      isVerified: item.isVerified,
      isActive: item.isActive,
    }),
  });

  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { fetch("/api/vendor-types").then(r => r.json()).then(setTypes).catch(() => {}); }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Manajemen Vendor</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola vendor mitra transportasi, akomodasi, dan layanan.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Vendor</span>
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Kontak Person</th>
                <th className="px-6 py-4">Telepon</th>
                <th className="px-6 py-4">Terverifikasi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Belum ada data vendor.</td></tr>
              ) : (
                rows.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/60 transition">
                    <td className="px-6 py-4 font-bold text-foreground">{v.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{v.contactPerson || "-"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{v.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${v.isVerified ? "bg-secondary/15 text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {v.isVerified ? "Terverifikasi" : "Belum"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(v)} className="p-2 text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 rounded-xl transition" title="Edit Vendor">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(v.id)} className="p-2 text-muted-foreground hover:text-destructive-600 hover:bg-destructive-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Vendor" : "Tambah Vendor"} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Tipe Vendor</label>
            <select name="typeId" value={form.typeId} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" required>
              <option value="">-- Pilih Tipe --</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Nama Vendor</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Kontak Person</label>
              <input name="contactPerson" value={form.contactPerson} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Telepon</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Area Layanan</label>
              <input name="serviceArea" value={form.serviceArea} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 text-sm">
              <input name="isVerified" type="checkbox" checked={form.isVerified} onChange={handleChange}
                className="w-4 h-4 rounded border-border text-primary-foreground focus:ring-primary/30" />
              <span className="font-medium text-foreground">Terverifikasi</span>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
                className="w-4 h-4 rounded border-border text-primary-foreground focus:ring-primary/30" />
              <span className="font-medium text-foreground">Aktif</span>
            </label>
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

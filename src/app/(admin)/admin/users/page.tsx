"use client";

import { useMemo } from "react";
import { useAdminCrud, useAdminTable } from "@/features/admin";
import { Users, ShieldCheck, UserCheck, Search, Edit, Trash2, Award, Mail, Phone, Calendar } from "lucide-react";
import Modal from "@/app/(admin)/admin/components/modal";
import ConfirmDelete from "@/app/(admin)/admin/components/confirm-delete";

interface UserItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phone: string | null;
  role: string;
  referralCode: string | null;
  referredBy: string | null;
  loyaltyPoints: number | null;
  createdAt: string;
  updatedAt: string;
}

interface UserForm {
  name: string;
  phone: string;
  role: string;
  loyaltyPoints: number;
}

const emptyForm: UserForm = {
  name: "",
  phone: "",
  role: "user",
  loyaltyPoints: 0,
};

export default function AdminUsersPage() {
  const {
    rows: users,
    loading,
    modalOpen,
    editing: editingUser,
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
  } = useAdminCrud<UserItem, UserForm>({
    endpoint: "/api/users",
    emptyForm,
    toForm: (user) => ({
      name: user.name,
      phone: user.phone || "",
      role: user.role || "user",
      loyaltyPoints: user.loyaltyPoints ?? 0,
    }),
  });

  const {
    query: search,
    setQuery: setSearch,
    status: roleFilter,
    setStatus: setRoleFilter,
    filtered: filteredUsers,
  } = useAdminTable(users, {
    searchKeys: ["name", "email", "phone"],
    statusKey: "role",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    await submit(e);
  }

  const stats = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const agentCount = users.filter((u) => u.role === "agent").length;
    const userCount = users.filter((u) => u.role === "user" || !u.role).length;
    return { total, adminCount, agentCount, userCount };
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Manajemen User Terdaftar</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data pengguna terdaftar, peran (role), dan poin loyalitas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-3xl border border-border/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-info-50 text-foreground flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total User</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-3xl border border-border/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Biasa</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.userCount}</p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-3xl border border-border/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-warning-50 text-warning-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Partner</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.agentCount}</p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-3xl border border-border/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administrator</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.adminCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-card p-4 sm:p-5 rounded-3xl border border-border/80 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, email, telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-muted-foreground shrink-0">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-card font-medium text-foreground"
          >
            <option value="all">Semua Role</option>
            <option value="user">User Biasa</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Referral & Poin</th>
                <th className="px-6 py-4">Tanggal Daftar</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {search || roleFilter !== "all"
                      ? "Tidak ditemukan pengguna yang sesuai dengan filter."
                      : "Belum ada user yang terdaftar."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initial = u.name ? u.name.charAt(0).toUpperCase() : "?";
                  return (
                    <tr key={u.id} className="hover:bg-muted/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 shrink-0 rounded-full border border-foreground/20 bg-foreground/10">
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                              {initial}
                            </span>
                            {u.image && (
                              <img
                                key={u.image}
                                src={u.image}
                                alt=""
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                                className="absolute inset-0 h-9 w-9 rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">
                              <span>{u.name}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{u.phone || "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-warning-100 text-warning-700 border border-warning-200">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        ) : u.role === "agent" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-success-100 text-success-700 border border-success-200">
                            <Award className="w-3 h-3" /> Agent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                            <UserCheck className="w-3 h-3" /> User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-mono text-[11px] font-semibold text-foreground">
                            Ref: {u.referralCode || "-"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Poin: <span className="font-bold text-primary-foreground">{u.loyaltyPoints ?? 0}</span> pts
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 rounded-xl transition"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(u.id)}
                            className="p-2 text-muted-foreground hover:text-destructive-600 hover:bg-destructive-50 rounded-xl transition"
                            title="Hapus User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title="Edit Pengguna" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Nama Pengguna</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={editingUser?.email || ""}
              disabled
              className="mt-1 w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">No. Telepon / WhatsApp</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. 08123456789"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Role Pengguna</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="user">User Biasa</option>
              <option value="agent">Agent Partner</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Loyalty Points</label>
            <input
              type="number"
              value={form.loyaltyPoints}
              onChange={(e) => setForm((prev) => ({ ...prev, loyaltyPoints: parseInt(e.target.value) || 0 }))}
              min={0}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={deletingId !== null}
        onClose={cancelDelete}
        onConfirm={executeDelete}
        title="Hapus Pengguna"
        message="Apakah Anda yakin ingin menghapus pengguna ini? Semua data terkait pengguna ini akan terhapus."
      />
    </div>
  );
}

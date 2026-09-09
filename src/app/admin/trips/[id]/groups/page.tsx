"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Check,
  Calendar,
  Users,
  Image,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Clock,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

interface Trip {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface Group {
  id: string;
  tripId: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  minParticipants: number | null;
  status: string;
  isActive: boolean | null;
  notes: string | null;
  quotaBooked: number;
  bookingCount: number;
  galleryCount: number;
  price: string | null;
}

interface GroupParticipant {
  bookingId: string;
  bookingCode: string;
  bookingStatus: string;
  totalParticipants: number;
  totalAmount: string;
  bookingDate: string;
  participants: {
    fullName: string;
    phone: string | null;
    isPrimary: boolean | null;
  }[];
  payment: {
    id: string;
    status: string;
    proofUrl: string | null;
    method: string | null;
    amount: string;
    adminNote: string | null;
  } | null;
}

interface GroupForm {
  startDate: string;
  endDate: string;
  maxParticipants: number;
  minParticipants: number;
  notes: string;
}

const emptyForm: GroupForm = {
  startDate: "",
  endDate: "",
  maxParticipants: 10,
  minParticipants: 1,
  notes: "",
};

function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  const [y, m, d] = val.slice(0, 10).split("-");
  if (!y || !m || !d) return val;
  return `${d}-${m}-${y}`;
}


const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-600",
  confirmed: "bg-blue-100 text-blue-700",
  ongoing: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminTripGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [form, setForm] = useState<GroupForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tripId]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/groups`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data");
      }
      setTrip(data.trip);
      setGroups(data.groups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingGroup(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(group: Group) {
    setEditingGroup(group);
    setForm({
      startDate: group.startDate?.slice(0, 10) || "",
      endDate: group.endDate?.slice(0, 10) || "",
      maxParticipants: group.maxParticipants || 10,
      minParticipants: group.minParticipants || 1,
      notes: group.notes || "",

    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.startDate) e.startDate = "Tanggal berangkat wajib diisi";
    if (!form.endDate) e.endDate = "Tanggal pulang wajib diisi";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = "Tanggal pulang harus setelah tanggal berangkat";
    }
    if (!form.maxParticipants || form.maxParticipants < 1) {
      e.maxParticipants = "Kuota minimal 1";
    }

    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
    setFormErrors({});
    setSaving(true);

    try {
      const url = editingGroup
        ? `/api/trips/${tripId}/groups/${editingGroup.id}`
        : `/api/trips/${tripId}/groups`;
      const res = await fetch(url, {
        method: editingGroup ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: form.startDate,
          endDate: form.endDate,
          maxParticipants: form.maxParticipants,
          minParticipants: form.minParticipants,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Gagal menyimpan: ${data.error || res.statusText}`);
        return;
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving group:", err);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(groupId: string) {
    try {
      const res = await fetch(`/api/trips/${tripId}/groups/${groupId}/activate`, {
        method: "PUT",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Gagal mengaktifkan: ${data.error || res.statusText}`);
        return;
      }
      fetchData();
    } catch (err) {
      console.error("Error activating group:", err);
      alert("Terjadi kesalahan saat mengaktifkan grup");
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/trips/${tripId}/groups/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Gagal menghapus: ${data.error || res.statusText}`);
        return;
      }
      setDeleteOpen(false);
      setDeletingId(null);
      fetchData();
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("Terjadi kesalahan saat menghapus");
    }
  }

  async function handleComplete(groupId: string) {
    if (!confirm("Tandai grup ini sebagai selesai? Semua booking akan diselesaikan dan peserta dapat memberikan ulasan.")) {
      return;
    }
    try {
      const res = await fetch(`/api/trips/${tripId}/groups/${groupId}/complete`, {
        method: "PUT",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Gagal menandai selesai: ${data.error || res.statusText}`);
        return;
      }
      alert("Grup telah ditandai selesai! Peserta akan diminta memberikan ulasan.");
      fetchData();
    } catch (err) {
      console.error("Error completing group:", err);
      alert("Terjadi kesalahan saat menandai selesai");
    }
  }

  async function toggleParticipants(groupId: string) {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      setParticipants([]);
      return;
    }
    setExpandedGroup(groupId);
    setParticipantsLoading(true);
    setParticipants([]);
    try {
      const res = await fetch(`/api/trips/${tripId}/groups/${groupId}/participants`);
      const data = await res.json();
      if (res.ok) {
        setParticipants(data);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setParticipantsLoading(false);
    }
  }

  function getPaymentStatusLabel(status: string): { label: string; className: string } {
    const statuses: Record<string, { label: string; className: string }> = {
      pending: { label: "Menunggu Bayar", className: "bg-amber-100 text-amber-700" },
      approved: { label: "Dikonfirmasi", className: "bg-green-100 text-green-700" },
      rejected: { label: "Ditolak", className: "bg-red-100 text-red-600" },
    };
    return statuses[status] || { label: status, className: "bg-slate-100 text-slate-600" };
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F49D1A]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Kelola Grup Trip
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {trip?.title || "Memuat..."} — Atur jadwal keberangkatan dan grup perjalanan
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Grup Baru</span>
        </button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Belum ada grup</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Buat grup keberangkatan pertama untuk trip ini. Setiap grup punya tanggal dan kuota sendiri.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 px-6 py-3 bg-[#F49D1A] text-white rounded-2xl text-sm font-semibold hover:bg-[#c47d12] transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buat Grup Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`bg-white rounded-3xl border-2 shadow-xs overflow-hidden transition ${
                group.isActive
                  ? "border-[#1CA6B7] ring-2 ring-[#1CA6B7]/20"
                  : "border-slate-200/80"
              }`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${group.isActive ? "bg-[#1CA6B7]/10" : "bg-slate-100"}`}>
                        <Calendar className={`w-5 h-5 ${group.isActive ? "text-[#1CA6B7]" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {formatDate(group.startDate)}
                          </h3>
                          {group.isActive && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1CA6B7]/15 text-[#1CA6B7]">
                              <Check className="w-3 h-3" />
                              AKTIF
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Sampai {formatDate(group.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Kuota</p>
                        <p className="text-lg font-bold text-slate-900">
                          {group.quotaBooked}/{group.maxParticipants}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Booking</p>
                        <p className="text-lg font-bold text-slate-900">{group.bookingCount}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Galeri</p>
                        <p className="text-lg font-bold text-slate-900">{group.galleryCount} foto</p>
                      </div>

                    </div>

                    {group.notes && (
                      <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                        {group.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[group.status] || "bg-slate-100 text-slate-600"}`}>
                      {group.status}
                    </span>
                  </div>
                </div>

                {/* Participants List */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => toggleParticipants(group.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Peserta ({group.bookingCount})
                    {expandedGroup === group.id ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-1" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    )}
                  </button>

                  {expandedGroup === group.id && (
                    <div className="mt-4 bg-slate-50 rounded-2xl p-4">
                      {participantsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-[#F49D1A]" />
                          <span className="ml-2 text-sm text-slate-500">Memuat data peserta...</span>
                        </div>
                      ) : participants.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Belum ada peserta terdaftar</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {participants.map((booking) => (
                            <div
                              key={booking.bookingId}
                              className="bg-white rounded-xl border border-slate-200 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono font-bold text-[#F49D1A] text-sm">
                                      {booking.bookingCode}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      booking.bookingStatus === "confirmed"
                                        ? "bg-green-100 text-green-700"
                                        : booking.bookingStatus === "pending"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-slate-100 text-slate-600"
                                    }`}>
                                      {booking.bookingStatus === "confirmed"
                                        ? "Terkonfirmasi"
                                        : booking.bookingStatus === "pending"
                                        ? "Menunggu"
                                        : booking.bookingStatus}
                                    </span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {booking.participants.map((p, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-[#1CA6B7]/10 text-[#1CA6B7] flex items-center justify-center text-[10px] font-bold shrink-0">
                                          {p.isPrimary ? "P" : idx + 1}
                                        </span>
                                        <span className="text-slate-700 truncate">
                                          {p.fullName}
                                        </span>
                                        {p.phone && (
                                          <span className="text-xs text-slate-400 shrink-0">
                                            {p.phone}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-slate-500">{booking.totalParticipants} org</p>
                                  <p className="text-xs font-bold text-slate-700">
                                    Rp {Number(booking.totalAmount).toLocaleString("id-ID")}
                                  </p>
                                </div>
                              </div>

                              {/* Payment Status */}
                              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {booking.payment ? (
                                    <>
                                      {booking.payment.proofUrl ? (
                                        <FileCheck className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-amber-500" />
                                      )}
                                      <span className="text-xs text-slate-600">
                                        {booking.payment.method || "Transfer"}
                                      </span>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        getPaymentStatusLabel(booking.payment.status).className
                                      }`}>
                                        {getPaymentStatusLabel(booking.payment.status).label}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">
                                      Belum ada pembayaran
                                    </span>
                                  )}
                                </div>
                                {booking.payment?.proofUrl && (
                                  <a
                                    href={booking.payment.proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-[#1CA6B7] hover:underline"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Lihat Bukti
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEdit(group)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  {!group.isActive && ["scheduled", "confirmed"].includes(group.status) && (
                    <button
                      onClick={() => handleActivate(group.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#1CA6B7] hover:bg-[#159ba9] rounded-xl transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aktifkan
                    </button>
                  )}

                  <button
                    onClick={() => window.location.href = `/admin/trips/${tripId}/groups/${group.id}/gallery`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Galeri
                  </button>

                  {group.status !== "completed" && (
                    <button
                      onClick={() => handleComplete(group.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Tandai Selesai
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setDeletingId(group.id);
                      setDeleteOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingGroup ? "Edit Grup" : "Tambah Grup Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Tanggal Berangkat *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] ${
                      formErrors.startDate ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Tanggal Pulang *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] ${
                      formErrors.endDate ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                  {formErrors.endDate && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Kuota Maksimal *
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    min={1}
                    value={form.maxParticipants}
                    onChange={handleChange}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] ${
                      formErrors.maxParticipants ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                  {formErrors.maxParticipants && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.maxParticipants}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Kuota Minimal
                  </label>
                  <input
                    type="number"
                    name="minParticipants"
                    min={1}
                    value={form.minParticipants}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                  />
                </div>
              </div>



              <div>
                <label className="block text-sm font-medium text-slate-700">Catatan</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Opsional: catatan untuk grup ini..."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#F49D1A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hapus Grup?</h3>
              <p className="text-sm text-slate-500 mt-2">
                Grup yang sudah memiliki booking tidak bisa dihapus.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setDeletingId(null);
                }}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

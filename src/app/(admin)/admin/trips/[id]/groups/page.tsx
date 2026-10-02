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
  Tag,
} from "lucide-react";
import ConfirmAction from "@/app/(admin)/admin/components/confirm-action";
import { EMPTY_GROUP_FORM, EMPTY_PRICE_FORM, PRICE_TIER_SUGGESTIONS, buildGroupPayload, mapGroupToForm, validateGroupForm, validatePriceForm } from "@/features/admin/group-form";
import type { GroupFormState, PriceTierFormState } from "@/features/admin/group-form";
import { formatTripPrice, parseTripPrice } from "@/features/admin/trip-form";

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

interface PriceTier {
  id: string;
  name: string;
  price: string;
  quota: number;
  quotaBooked: number | null;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean | null;
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

const emptyForm: GroupFormState = { ...EMPTY_GROUP_FORM };

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
  const [form, setForm] = useState<GroupFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [completeOpen, setCompleteOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; message: string }>({
    open: false, title: "", message: "",
  });
  function showAlert(title: string, message: string) {
    setAlertModal({ open: true, title, message });
  }

  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const [expandedPrices, setExpandedPrices] = useState<string | null>(null);
  const [prices, setPrices] = useState<PriceTier[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [priceModalGroup, setPriceModalGroup] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<PriceTier | null>(null);
  const [priceForm, setPriceForm] = useState<PriceTierFormState>({ ...EMPTY_PRICE_FORM });
  const [priceErrors, setPriceErrors] = useState<Record<string, string>>({});
  const [priceSaving, setPriceSaving] = useState(false);
  const [deletingPrice, setDeletingPrice] = useState<{ groupId: string; tier: PriceTier } | null>(null);

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
    setForm(mapGroupToForm(group));
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): Record<string, string> {
    return validateGroupForm(form);
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
        body: JSON.stringify(buildGroupPayload(form)),
      });

      if (!res.ok) {
        const data = await res.json();
        showAlert("Gagal Menyimpan", data.error || res.statusText);
        return;
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving group:", err);
      showAlert("Terjadi Kesalahan", "Terjadi kesalahan saat menyimpan");
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
        showAlert("Gagal Mengaktifkan", data.error || res.statusText);
        return;
      }
      fetchData();
    } catch (err) {
      console.error("Error activating group:", err);
      showAlert("Terjadi Kesalahan", "Terjadi kesalahan saat mengaktifkan grup");
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
        showAlert("Gagal Menghapus", data.error || res.statusText);
        return;
      }
      setDeleteOpen(false);
      setDeletingId(null);
      fetchData();
    } catch (err) {
      console.error("Error deleting group:", err);
      showAlert("Terjadi Kesalahan", "Terjadi kesalahan saat menghapus");
    }
  }

  async function handleComplete(groupId: string) {
    setCompletingId(groupId);
    setCompleteOpen(true);
  }

  async function doComplete() {
    if (!completingId) return;
    const res = await fetch(`/api/trips/${tripId}/groups/${completingId}/complete`, {
      method: "PUT",
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || res.statusText);
    }
    fetchData();
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

  async function togglePrices(groupId: string) {
    if (expandedPrices === groupId) {
      setExpandedPrices(null);
      setPrices([]);
      return;
    }
    setExpandedPrices(groupId);
    await refreshPrices(groupId);
  }

  async function refreshPrices(groupId: string) {
    setPricesLoading(true);
    setPrices([]);
    try {
      const res = await fetch(`/api/trips/${tripId}/groups/${groupId}/prices`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setPrices(data);
    } catch (err) {
      console.error("Error fetching prices:", err);
    } finally {
      setPricesLoading(false);
    }
  }

  function openPriceCreate(groupId: string) {
    setPriceModalGroup(groupId);
    setEditingPrice(null);
    setPriceForm({ ...EMPTY_PRICE_FORM });
    setPriceErrors({});
  }

  function openPriceEdit(groupId: string, tier: PriceTier) {
    setPriceModalGroup(groupId);
    setEditingPrice(tier);
    setPriceForm({
      name: tier.name,
      price: tier.price,
      quota: tier.quota,
      validFrom: tier.validFrom?.slice(0, 10) || "",
      validUntil: tier.validUntil?.slice(0, 10) || "",
      isActive: tier.isActive ?? true,
    });
    setPriceErrors({});
  }

  async function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceModalGroup) return;
    const validationErrors = validatePriceForm(priceForm);
    if (Object.keys(validationErrors).length > 0) {
      setPriceErrors(validationErrors);
      return;
    }
    setPriceErrors({});
    setPriceSaving(true);
    try {
      const url = editingPrice
        ? `/api/trips/${tripId}/groups/${priceModalGroup}/prices/${editingPrice.id}`
        : `/api/trips/${tripId}/groups/${priceModalGroup}/prices`;
      const res = await fetch(url, {
        method: editingPrice ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: priceForm.name,
          price: priceForm.price,
          quota: Number(priceForm.quota),
          validFrom: priceForm.validFrom || null,
          validUntil: priceForm.validUntil || null,
          isActive: priceForm.isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        showAlert("Gagal Menyimpan", data.error || res.statusText);
        return;
      }
      setPriceModalGroup(null);
      await refreshPrices(priceModalGroup);
      fetchData();
    } catch (err) {
      console.error("Error saving price:", err);
      showAlert("Terjadi Kesalahan", "Terjadi kesalahan saat menyimpan tier");
    } finally {
      setPriceSaving(false);
    }
  }

  async function handlePriceToggleActive(groupId: string, tier: PriceTier) {
    try {
      const res = await fetch(`/api/trips/${tripId}/groups/${groupId}/prices/${tier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !(tier.isActive ?? true) }),
      });
      if (!res.ok) {
        const data = await res.json();
        showAlert("Gagal Mengubah", data.error || res.statusText);
        return;
      }
      await refreshPrices(groupId);
      fetchData();
    } catch (err) {
      console.error("Error toggling price:", err);
    }
  }

  async function doDeletePrice() {
    if (!deletingPrice) return;
    const res = await fetch(
      `/api/trips/${tripId}/groups/${deletingPrice.groupId}/prices/${deletingPrice.tier.id}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || res.statusText);
    }
    setDeletingPrice(null);
    await refreshPrices(deletingPrice.groupId);
    fetchData();
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setPriceForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
    setPriceErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
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
              className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition ${
                group.isActive
                  ? "border-slate-200/80 shadow-md"
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
                          {group.isActive && group.status !== "completed" && (
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

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
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
                  <button
                    onClick={() => togglePrices(group.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Harga{expandedPrices === group.id && !pricesLoading ? ` (${prices.length})` : ""}
                    {expandedPrices === group.id ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-1" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    )}
                  </button>
                  </div>

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
                  {expandedPrices === group.id && (
                    <div className="mt-4 bg-slate-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tier Harga</p>
                        <button
                          onClick={() => openPriceCreate(group.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#F49D1A] hover:bg-[#c47d12] rounded-xl transition"
                        >
                          <Plus className="w-3 h-3" />
                          Tambah Tier
                        </button>
                      </div>
                      {pricesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-[#F49D1A]" />
                          <span className="ml-2 text-sm text-slate-500">Memuat tier harga...</span>
                        </div>
                      ) : prices.length === 0 ? (
                        <div className="text-center py-8">
                          <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Belum ada tier harga</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {prices.map((tier) => (
                            <div
                              key={tier.id}
                              className="bg-white rounded-xl border border-slate-200 p-3.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F49D1A]/10 text-[#F49D1A]">
                                      {tier.name}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${tier.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                      {tier.isActive ? "Aktif" : "Nonaktif"}
                                    </span>
                                  </div>
                                  <p className="text-base font-bold text-slate-900">{formatTripPrice(tier.price)}</p>
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    Terisi {tier.quotaBooked ?? 0}/{tier.quota} · {tier.validFrom || tier.validUntil ? `${tier.validFrom?.slice(0, 10) || "…"} s/d ${tier.validUntil?.slice(0, 10) || "…"}` : "Selalu berlaku"}
                                  </p>
                                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                                    <div
                                      className="h-full rounded-full bg-[#F49D1A] transition-all"
                                      style={{ width: `${Math.min(((tier.quotaBooked ?? 0) / Math.max(tier.quota, 1)) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handlePriceToggleActive(group.id, tier)}
                                    title={tier.isActive ? "Nonaktifkan" : "Aktifkan"}
                                    className="p-2 text-slate-500 hover:text-[#1CA6B7] hover:bg-[#1CA6B7]/10 rounded-xl transition"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openPriceEdit(group.id, tier)}
                                    title="Edit tier"
                                    className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingPrice({ groupId: group.id, tier })}
                                    title="Hapus tier"
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#F49D1A] hover:bg-[#c47d12] rounded-xl transition"
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

      {priceModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPriceModalGroup(null)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingPrice ? "Edit Tier Harga" : "Tambah Tier Harga"}
            </h2>
            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nama Tier *</label>
                <input
                  name="name"
                  value={priceForm.name}
                  onChange={handlePriceChange}
                  list="tier-suggestions"
                  placeholder="cth: Dewasa, Anak, Early Bird"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] ${priceErrors.name ? "border-red-400" : "border-slate-300"}`}
                />
                <datalist id="tier-suggestions">
                  {PRICE_TIER_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                {priceErrors.name && <p className="mt-1 text-xs text-red-600">{priceErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Harga (Rp) *</label>
                  <input
                    name="price"
                    value={formatTripPrice(priceForm.price) || priceForm.price}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setPriceForm((prev) => ({ ...prev, price: digits }));
                      setPriceErrors((prev) => {
                        const next = { ...prev };
                        delete next.price;
                        return next;
                      });
                    }}
                    inputMode="numeric"
                    placeholder="cth: 1500000"
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] ${priceErrors.price ? "border-red-400" : "border-slate-300"}`}
                  />
                  {priceErrors.price && <p className="mt-1 text-xs text-red-600">{priceErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kuota *</label>
                  <input
                    type="number"
                    name="quota"
                    min={1}
                    value={priceForm.quota}
                    onChange={handlePriceChange}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] ${priceErrors.quota ? "border-red-400" : "border-slate-300"}`}
                  />
                  {priceErrors.quota && <p className="mt-1 text-xs text-red-600">{priceErrors.quota}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Berlaku Dari</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={priceForm.validFrom}
                    onChange={handlePriceChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Sampai</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={priceForm.validUntil}
                    onChange={handlePriceChange}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] ${priceErrors.validUntil ? "border-red-400" : "border-slate-300"}`}
                  />
                  {priceErrors.validUntil && <p className="mt-1 text-xs text-red-600">{priceErrors.validUntil}</p>}
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={priceForm.isActive}
                  onChange={handlePriceChange}
                  className="w-4 h-4 rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30"
                />
                <span className="font-medium text-slate-700">Tier aktif</span>
              </label>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={priceSaving}
                  className="rounded-xl bg-[#F49D1A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition disabled:opacity-50"
                >
                  {priceSaving ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => setPriceModalGroup(null)}
                  className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      <ConfirmAction
        open={completeOpen}
        onClose={() => { setCompleteOpen(false); setCompletingId(null); }}
        onConfirm={doComplete}
        title="Tandai Grup Selesai"
        message="Tandai grup ini sebagai selesai? Semua booking akan diselesaikan dan peserta dapat memberikan ulasan."
        confirmLabel="Ya, Tandai Selesai"
        confirmClassName="rounded-xl bg-[#F49D1A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c47d12] transition disabled:opacity-50 inline-flex items-center gap-2"
      />

      <ConfirmAction
        open={alertModal.open}
        onClose={() => setAlertModal({ open: false, title: "", message: "" })}
        onConfirm={async () => setAlertModal({ open: false, title: "", message: "" })}
        title={alertModal.title}
        message={alertModal.message}
        confirmLabel="OK"
        confirmClassName="rounded-xl bg-[#F49D1A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c47d12] transition disabled:opacity-50 inline-flex items-center gap-2"
      />
      <ConfirmAction
        open={deletingPrice !== null}
        onClose={() => setDeletingPrice(null)}
        onConfirm={doDeletePrice}
        title="Hapus Tier?"
        message={deletingPrice ? `Hapus tier "${deletingPrice.tier.name}" (${formatTripPrice(deletingPrice.tier.price)})? Tier yang sudah memiliki booking tidak bisa dihapus.` : ""}
        confirmLabel="Ya, Hapus"
        confirmClassName="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 inline-flex items-center gap-2"
      />
    </div>
  );
}

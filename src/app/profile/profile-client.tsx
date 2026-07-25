"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  ShoppingBag,
  Clock,
  Home,
  Ticket,
  HelpCircle,
  LogOut,
  Compass,
  Gift,
  ChevronRight,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Users,
  Sparkles,
  Route,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export interface UserProfile {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  loyaltyPoints?: number | null;
  createdAt?: string | Date | null;
}

export interface UserBooking {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount: string;
  bookingDate?: string | Date;
  totalParticipants?: number;
}

interface PrivateRequest {
  id: string;
  title: string;
  durationDays: number;
  participantsCount: number;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  budgetEstimate: string | null;
}

interface Proposal {
  id: string;
  requestId: string;
  proposalContent: string;
  estimatedPrice: string | null;
  inclusions: string | null;
  exclusions: string | null;
  status: string;
  createdAt: string;
}

interface ProfileClientProps {
  user: UserProfile | null;
  userBookings: UserBooking[];
  initialTab?: string;
}

export function ProfileClientView({ user, userBookings, initialTab }: ProfileClientProps) {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"beranda" | "transaksi" | "private-trip" | "voucher" | "bantuan">(
    (tabFromUrl || initialTab) === "private-trip" ? "private-trip" : "beranda"
  );
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [copied, setCopied] = useState(false);

  // Private trip state
  const [privateRequests, setPrivateRequests] = useState<PrivateRequest[]>([]);
  const [privateLoading, setPrivateLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrivateRequest & { proposals: Proposal[] } | null>(null);
  const [proposalAction, setProposalAction] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [revisionReason, setRevisionReason] = useState("");

  const name = user?.name || "Pengguna OpenTrip";
  const email = user?.email || "user@opentrip.co.id";
  const phone = user?.phone || "6285155433613";
  const points = user?.loyaltyPoints ?? 555;
  const initialLetter = name.charAt(0).toUpperCase();

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredBookings = userBookings.filter((b) => {
    if (statusFilter === "semua") return true;
    if (statusFilter === "pending") return b.status === "pending";
    if (statusFilter === "confirmed") return b.status === "confirmed";
    if (statusFilter === "completed") return b.status === "completed" || b.status === "finished";
    return true;
  });

  const pendingCount = userBookings.filter((b) => b.status === "pending").length;
  const confirmedCount = userBookings.filter((b) => b.status === "confirmed").length;

  // Fetch private requests
  const fetchPrivateRequests = useCallback(async () => {
    setPrivateLoading(true);
    try {
      const res = await fetch("/api/private-trip");
      if (res.ok) {
        const data = await res.json();
        setPrivateRequests(data);
      }
    } catch { /* ignore */ }
    setPrivateLoading(false);
  }, [setPrivateRequests, setPrivateLoading]);

  useEffect(() => {
    if (activeTab === "private-trip") {
      fetchPrivateRequests().catch(() => {});
    }
  }, [activeTab, fetchPrivateRequests]);

  async function openRequestDetail(id: string) {
    setActionMsg("");
    const res = await fetch("/api/private-trip/" + id);
    if (res.ok) {
      const data = await res.json();
      setSelectedRequest(data);
    }
  }

  async function handleProposalAction(requestId: string, proposalId: string, action: string) {
    setActionMsg("");
    const body: Record<string, string> = { proposalId, action };
    if (action === "revise" && revisionReason.trim()) {
      body.revisionReason = revisionReason.trim();
    }
    const res = await fetch("/api/private-trip/" + requestId + "/proposal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) {
      setActionMsg(result.error || "Gagal");
      return;
    }
    setActionMsg("Berhasil!");
    setProposalAction("");
    setRevisionReason("");
    openRequestDetail(requestId);
    fetchPrivateRequests();
  }

  function formatRupiah(val: string | null) {
    if (!val) return "-";
    const num = Number(val);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  }

  function renderStatusBadge(status: string) {
    const styles: Record<string, string> = {
      draft: "bg-slate-100 text-slate-700",
      submitted: "bg-amber-100 text-amber-800",
      reviewed: "bg-blue-100 text-blue-700",
      revision: "bg-purple-100 text-purple-700",
      approved: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-700",
      pending: "bg-amber-100 text-amber-800",
      accepted: "bg-emerald-100 text-emerald-800",
      revised: "bg-purple-100 text-purple-700",
    };
    return (
      <span className={"px-2.5 py-1 rounded-full text-[10px] font-bold " + (styles[status] || "bg-slate-100 text-slate-600")}>
        {status}
      </span>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR PROFILE CARD ================= */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
              
              {/* Top Banner Gradient */}
              <div className="h-32 bg-gradient-to-r from-[#E06D26] via-amber-500 to-[#E86016] relative">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>

              {/* Avatar & User Info */}
              <div className="relative px-6 pb-6 text-center">
                <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-md -mt-14 mx-auto relative z-10">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={name}
                      className="w-full h-full rounded-full object-cover border-2 border-orange-100"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-orange-100 text-[#E06D26] font-black text-3xl flex items-center justify-center border-2 border-orange-200">
                      {initialLetter}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Akun Terverifikasi">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <h1 className="text-xl font-black text-slate-900 mt-3 tracking-tight">{name}</h1>
                
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1 font-mono">
                  <span>{phone}</span>
                  <button
                    onClick={handleCopyPhone}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                    title="Salin Nomor HP"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mt-0.5">
                  <Mail className="w-3 h-3 text-[#E06D26]" />
                  <span>{email}</span>
                </div>
                
                <p className="text-[11px] text-slate-400 mt-1">Anggota OpenTrip Lansia sejak 2020</p>

                {/* Sidebar Navigation Menu Tabs */}
                <nav className="mt-6 space-y-1 text-left">
                  <button
                    onClick={() => setActiveTab("beranda")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                      activeTab === "beranda"
                        ? "bg-orange-50 text-[#E06D26] shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${activeTab === "beranda" ? "bg-[#E06D26] text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Home className="w-4 h-4" />
                      </div>
                      <span>Beranda Profil</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeTab === "beranda" ? "text-[#E06D26]" : "text-slate-400"}`} />
                  </button>

                  <button
                    onClick={() => setActiveTab("transaksi")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                      activeTab === "transaksi"
                        ? "bg-orange-50 text-[#E06D26] shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${activeTab === "transaksi" ? "bg-[#E06D26] text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Compass className="w-4 h-4" />
                      </div>
                      <span>Riwayat Open Trip</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeTab === "transaksi" ? "text-[#E06D26]" : "text-slate-400"}`} />
                  </button>

                  <button
                    onClick={() => setActiveTab("private-trip")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                      activeTab === "private-trip"
                        ? "bg-orange-50 text-[#E06D26] shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${activeTab === "private-trip" ? "bg-[#E06D26] text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <span>Private Trip Saya</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeTab === "private-trip" ? "text-[#E06D26]" : "text-slate-400"}`} />
                  </button>

                  <button
                    onClick={() => setActiveTab("voucher")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                      activeTab === "voucher"
                        ? "bg-orange-50 text-[#E06D26] shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${activeTab === "voucher" ? "bg-[#E06D26] text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Ticket className="w-4 h-4" />
                      </div>
                      <span>Voucher & Promo</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeTab === "voucher" ? "text-[#E06D26]" : "text-slate-400"}`} />
                  </button>

                  <button
                    onClick={() => setActiveTab("bantuan")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                      activeTab === "bantuan"
                        ? "bg-orange-50 text-[#E06D26] shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${activeTab === "bantuan" ? "bg-[#E06D26] text-white" : "bg-slate-100 text-slate-600"}`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span>Bantuan CS 24/7</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeTab === "bantuan" ? "text-[#E06D26]" : "text-slate-400"}`} />
                  </button>

                  <button
                    onClick={() => alert("Anda telah keluar.")}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition mt-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span>Keluar</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </button>
                </nav>

              </div>
            </div>
          </div>

          {/* ================= RIGHT MAIN CONTENT AREA ================= */}
          <div className="lg:col-span-8 space-y-8">

            {activeTab === "private-trip" ? (
              /* ================= PRIVATE TRIP TAB ================= */
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#E06D26] via-amber-500 to-[#E86016] rounded-3xl p-6 sm:p-8 text-white relative shadow-xl shadow-orange-500/20 overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] rounded-3xl pointer-events-none"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white/90 block">Private Trip Saya</span>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">Request Perjalanan Khusus</h2>
                      <p className="text-sm text-white/80 mt-1">Pantau status request dan proposal Anda di sini.</p>
                    </div>
                    <Link href="/private-trip" className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-white transition flex items-center gap-2 shrink-0">
                      <Route className="w-3.5 h-3.5" />
                      <span>Buat Request Baru</span>
                    </Link>
                  </div>
                </div>

                {/* Detail view */}
                {selectedRequest ? (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
                    <button onClick={() => { setSelectedRequest(null); setActionMsg(""); }} className="text-xs font-semibold text-slate-500 hover:text-[#E06D26] transition flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 rotate-180" /> Kembali ke daftar
                    </button>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900">{selectedRequest.title}</h3>
                      {renderStatusBadge(selectedRequest.status)}
                    </div>

                    {actionMsg && (
                      <div className={"flex items-start gap-3 rounded-2xl p-4 text-sm " + (actionMsg.includes("Gagal") ? "bg-red-50 border border-red-200 text-red-700" : "bg-emerald-50 border border-emerald-200 text-emerald-700")}>
                        {actionMsg.includes("Gagal") ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
                        <span>{actionMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><span className="block text-[11px] font-semibold text-slate-400 uppercase">Durasi</span><span className="font-bold text-slate-900">{selectedRequest.durationDays} hari</span></div>
                      <div><span className="block text-[11px] font-semibold text-slate-400 uppercase">Peserta</span><span className="font-bold text-slate-900">{selectedRequest.participantsCount} orang</span></div>
                      <div><span className="block text-[11px] font-semibold text-slate-400 uppercase">Budget</span><span className="font-bold text-[#E06D26]">{formatRupiah(selectedRequest.budgetEstimate)}</span></div>
                      <div><span className="block text-[11px] font-semibold text-slate-400 uppercase">Tgl Submit</span><span className="font-bold text-slate-900">{selectedRequest.submittedAt ? new Date(selectedRequest.submittedAt).toLocaleDateString("id-ID") : "-"}</span></div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900">Riwayat Proposal</h4>
                      {(!selectedRequest.proposals || selectedRequest.proposals.length === 0) ? (
                        <p className="text-sm text-slate-400">Belum ada proposal dari admin. Silakan tunggu.</p>
                      ) : (
                        (selectedRequest.proposals as Proposal[]).map((prop) => (
                          <div key={prop.id} className="border border-slate-200 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              {renderStatusBadge(prop.status)}
                              <span className="text-[11px] text-slate-400">{new Date(prop.createdAt).toLocaleString("id-ID")}</span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{prop.proposalContent}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div><span className="block font-semibold text-slate-500">Estimasi Harga</span><span className="font-bold text-[#E06D26]">{formatRupiah(prop.estimatedPrice)}</span></div>
                              <div><span className="block font-semibold text-slate-500">Termasuk</span><span className="text-slate-700">{prop.inclusions || "-"}</span></div>
                              <div><span className="block font-semibold text-slate-500">Tidak Termasuk</span><span className="text-slate-700">{prop.exclusions || "-"}</span></div>
                            </div>

                            {(prop.status === "pending" || prop.status === "revised") && (
                              <div className="pt-3 border-t border-slate-100 space-y-3">
                                {proposalAction !== prop.id ? (
                                  <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setProposalAction(prop.id)} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5">
                                      <ThumbsUp className="w-3.5 h-3.5" /> Terima Proposal
                                    </button>
                                    <button onClick={() => { setProposalAction(prop.id); setRevisionReason(""); }} className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5">
                                      <RefreshCw className="w-3.5 h-3.5" /> Minta Revisi
                                    </button>
                                    <button onClick={async () => { await handleProposalAction(selectedRequest.id, prop.id, "reject"); }} className="rounded-xl border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 text-xs font-bold transition flex items-center gap-1.5">
                                      <ThumbsDown className="w-3.5 h-3.5" /> Tolak
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-3 bg-slate-50 rounded-2xl p-4">
                                    {proposalAction === prop.id && (
                                      <>
                                        <div className="flex gap-2">
                                          <button onClick={async () => { await handleProposalAction(selectedRequest.id, prop.id, "accept"); }} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold transition">Ya, Terima</button>
                                          {revisionReason !== undefined && (
                                            <div className="flex-1">
                                              <textarea
                                                value={revisionReason}
                                                onChange={(e) => setRevisionReason(e.target.value)}
                                                placeholder="Tulis alasan revisi..."
                                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#E06D26]/30 resize-none"
                                                rows={2}
                                              />
                                              <button onClick={async () => { await handleProposalAction(selectedRequest.id, prop.id, "revise"); }} className="mt-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 text-xs font-bold transition">Kirim Permintaan Revisi</button>
                                            </div>
                                          )}
                                        </div>
                                        <button onClick={() => setProposalAction("")} className="text-xs text-slate-400 hover:text-slate-600">Batal</button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {prop.status === "accepted" && (
                              <div className="pt-3 border-t border-slate-100 bg-emerald-50 rounded-2xl p-4 text-sm text-emerald-700">
                                <p className="font-bold">Proposal diterima. Tim kami akan menghubungi Anda untuk proses booking dan pembayaran.</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-4">
                    <h3 className="font-bold text-slate-900">Daftar Request</h3>
                    {privateLoading ? (
                      <div className="py-8 text-center text-sm text-slate-400">Memuat data...</div>
                    ) : privateRequests.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 space-y-2">
                        <Route className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">Belum ada pengajuan Private Trip.</p>
                        <Link href="/private-trip" className="text-[#E06D26] font-semibold text-xs hover:underline">Ajukan Private Trip sekarang</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {privateRequests.map((req: PrivateRequest) => (
                          <div key={req.id} className="border border-slate-200 rounded-2xl p-4 hover:border-[#E06D26]/30 transition cursor-pointer" onClick={() => openRequestDetail(req.id)}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-slate-900 text-sm">{req.title}</h4>
                              {renderStatusBadge(req.status)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>{req.durationDays} hari</span>
                              <span>{req.participantsCount} orang</span>
                              <span className="text-[#E06D26] font-semibold">{formatRupiah(req.budgetEstimate)}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">{req.submittedAt ? new Date(req.submittedAt).toLocaleDateString("id-ID") : "-"}</span>
                              <span className="text-[11px] font-semibold text-[#E06D26] flex items-center gap-1">Lihat Detail <Eye className="w-3 h-3" /></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (<>
            <div className="bg-gradient-to-r from-[#E06D26] via-amber-500 to-[#E86016] rounded-3xl p-6 sm:p-8 text-white relative shadow-xl shadow-orange-500/20 overflow-visible">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] rounded-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between relative z-10 pb-6">
                <div>
                  <span className="text-xs font-semibold text-white/90 block">TripPoin Kamu</span>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5 flex items-center gap-2">
                    <span>🪙 {points} Poin</span>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow hover:bg-white transition flex items-center gap-2 cursor-pointer">
                  <span>Tukar Poin</span>
                  <span className="text-[#E06D26] font-extrabold">→</span>
                </div>
              </div>

              {/* Travel Quick Actions Floating Card */}
              <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 grid grid-cols-3 divide-x divide-slate-100 text-center relative z-20 -mb-16">
                <Link
                  href="/trips"
                  className="flex flex-col items-center gap-2 p-2 hover:bg-orange-50/50 rounded-xl transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-[#E06D26] flex items-center justify-center group-hover:scale-110 transition shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#E06D26]">Cari Open Trip</span>
                </Link>

                <Link
                  href="/private-trip"
                  className="flex flex-col items-center gap-2 p-2 hover:bg-orange-50/50 rounded-xl transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#E06D26]">Ajukan Private Trip</span>
                </Link>

                <button
                  onClick={() => setActiveTab("voucher")}
                  className="flex flex-col items-center gap-2 p-2 hover:bg-orange-50/50 rounded-xl transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
                    <Gift className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#E06D26]">Voucher Travel</span>
                </button>
              </div>
            </div>

            {/* Spacer for Floating Quick Actions */}
            <div className="pt-8"></div>

            {/* Overview Stats Bar for Travel & OpenTrip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#E06D26] flex items-center justify-center shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Open Trip Aktif</span>
                  <span className="text-lg font-black text-slate-900">{confirmedCount} Trip Mendatang</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Private Trip</span>
                  <span className="text-lg font-black text-slate-900">0 Pengajuan</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Voucher Travel</span>
                  <span className="text-lg font-black text-slate-900">2 Kupon Aktif</span>
                </div>
              </div>
            </div>

            {/* Riwayat Pemesanan / Daftar Transaksi Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#E06D26]" />
                  <h3 className="text-lg font-black text-slate-900">Riwayat Pemesanan Trip</h3>
                </div>

                {/* Filter Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/70 p-1 rounded-2xl text-xs font-semibold">
                  <button
                    onClick={() => setStatusFilter("semua")}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      statusFilter === "semua" ? "bg-white text-[#E06D26] shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua ({userBookings.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      statusFilter === "pending" ? "bg-white text-[#E06D26] shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Menunggu Pembayaran ({pendingCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter("confirmed")}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      statusFilter === "confirmed" ? "bg-white text-[#E06D26] shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Terkonfirmasi ({confirmedCount})
                  </button>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-slate-100 p-5 bg-slate-50/50 hover:bg-orange-50/20 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#E06D26]" />
                        <span className="font-mono text-xs font-bold text-slate-700">{b.bookingCode}</span>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          b.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {b.status === "pending" ? "Menunggu Pembayaran" : b.status === "confirmed" ? "Terkonfirmasi" : b.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-end pt-3 border-t border-slate-200/60">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Total Biaya Trip</span>
                        <span className="font-black text-[#E06D26] text-base">
                          Rp {parseInt(b.totalAmount || "0").toLocaleString("id-ID")}
                        </span>
                      </div>
                      <button className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition shadow-sm">
                        Detail Pemesanan →
                      </button>
                    </div>
                  </div>
                ))}

                {filteredBookings.length === 0 && (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <p className="text-sm font-semibold text-slate-600">Belum ada riwayat booking trip untuk kategori ini.</p>
                    <p className="text-xs text-slate-400">Pesan destinasi impian ramah lansia sekarang di OpenTrip!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Special OpenTrip Promo Banner */}
            <div className="bg-[#0B0F19] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-2 text-center sm:text-left relative z-10 max-w-md">
                <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border border-orange-500/30">
                  <Sparkles className="w-3 h-3" />
                  <span>OPENTRIP & PRIVATE TRIP LANSIA</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white">
                  Nikmati Liburan Ramah Lansia & Private Custom
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dapatkan pendampingan medis, akomodasi nyaman, serta perjalanan ramah lansia dengan harga spesial.
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-3 relative z-10 shrink-0">
                <Link
                  href="/trips"
                  className="bg-gradient-to-r from-[#E06D26] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-lg shadow-orange-500/30 transition transform hover:-translate-y-0.5 inline-block text-center"
                >
                  Jelajahi Trip Now →
                </Link>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-1.5 bg-[#E06D26] rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                </div>
              </div>
            </div>

            </>)}
          </div>

        </div>
      </div>
    </div>
  );
}

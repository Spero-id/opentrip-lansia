"use client";

import { useEffect, useRef, useState } from "react";
import BookingSummary from "./BookingSummary";
import PriceBreakdown from "./PriceBreakdown";
import Image from "next/image";
import { Upload } from "lucide-react";

export default function PaymentStep({ checkout, onPay, onBack }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
      <div className="lg:col-span-3 space-y-6">
        <BookingSummary destination={checkout.destination} />
        <PaymentSelector method={checkout.paymentMethod} onChange={checkout.setPaymentMethod} />
        <ProofUploader checkout={checkout} />

        {checkout.error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {checkout.error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={onPay}
            disabled={!checkout.paymentMethod || !checkout.proofUrl || checkout.isLoading}
            className="flex-1 bg-[#F49D1A] text-white py-3 rounded-xl font-semibold hover:bg-[#c47d12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checkout.isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Memproses...
              </>
            ) : (
              "Kirim Bukti Pembayaran"
            )}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <PriceBreakdown
          destination={checkout.destination}
          pricePerPax={checkout.destination?.priceMin ?? 0}
          pax={checkout.pax}
          ticketSubtotal={checkout.ticketSubtotal}
          serviceFee={checkout.serviceFee}
          discount={checkout.discount}
          total={checkout.total}
          appliedVoucher={checkout.appliedVoucher}
          hideTerms
        />
      </div>
    </div>
  );
}

function PaymentSelector({ method, onChange }) {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payments/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setAccounts(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const account = accounts.find((a) => a.method === method) || null;

  const methods = [
    { id: "bri", alt: "BRI", icon: "/logo-BRI.png" },
    { id: "mandiri", alt: "Mandiri", icon: "/logo-Mandiri.png" },
    { id: "gopay", alt: "GoPay", icon: "/logo-Gopay.png" },
    { id: "ovo", alt: "OVO", icon: "/logo-Ovo.jpg" },
    { id: "dana", alt: "DANA", icon: "/logo-Dana.webp" },
    { id: "qris", alt: "QRIS", icon: "/logo-Qris-2.png" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-gray-900">Metode Pembayaran</h2>
        <p className="text-xs text-gray-400 mt-0.5">Pilih metode pembayaran yang kamu inginkan.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {methods.map((m) => {
          const active = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                active
                  ? "border-[#F49D1A] bg-[#F49D1A]/5 ring-2 ring-[#F49D1A]/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="w-full h-9 flex items-center justify-center">
                <Image src={m.icon} alt={m.alt} width={62} height={62} className="object-contain max-h-9" />
              </div>
              <span className={`text-xs font-semibold ${active ? "text-[#F49D1A]" : "text-gray-600"}`}>
                {m.alt}
              </span>
              {active && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F49D1A] flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {account && <AccountCard account={account} />}
    </div>
  );
}

function AccountCard({ account }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard tidak tersedia
    }
  };

  return (
    <div className="rounded-xl border border-[#1CA6B7]/20 bg-[#1CA6B7]/5 p-4 space-y-2">
      <p className="text-xs font-bold text-gray-900">Transfer ke:</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Bank</span>
        <span className="font-semibold text-gray-800">{account.bankName}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Atas Nama</span>
        <span className="font-semibold text-gray-800">{account.accountHolder}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs bg-white rounded-lg px-3 py-2">
        <span className="text-gray-500">Nomor</span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[#F49D1A] tracking-wide">{account.accountNumber}</span>
          <button
            onClick={copy}
            className="text-[11px] font-semibold text-[#1CA6B7] hover:underline"
          >
            {copied ? "Tersalin" : "Salin"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProofUploader({ checkout }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/payments/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data?.error || "Gagal mengupload bukti transfer.");
        return;
      }
      checkout.setProofUrl(data.url);
    } catch {
      setUploadError("Gagal mengupload bukti transfer. Coba lagi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removeProof() {
    if (checkout.proofUrl) {
      fetch(`/api/payments/upload?url=${encodeURIComponent(checkout.proofUrl)}`, { method: "DELETE" }).catch(() => {});
    }
    checkout.setProofUrl("");
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-gray-900">Bukti Transfer</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Upload bukti transfer senilai total pembayaran di atas.
        </p>
      </div>

      {checkout.proofUrl ? (
        <div className="space-y-2">
          <img
            src={checkout.proofUrl}
            alt="Bukti transfer"
            className="w-full max-h-64 object-contain rounded-xl border border-gray-200 bg-gray-50"
          />
          <button
            onClick={removeProof}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Hapus Bukti
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#F49D1A]/50 hover:bg-[#F49D1A]/5 transition">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {uploading ? (
            <div className="w-6 h-6 rounded-full border-2 border-[#F49D1A]/30 border-t-[#F49D1A] animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-gray-400" />
          )}
          <span className="text-xs font-semibold text-gray-600">
            {uploading ? "Mengupload..." : "Klik untuk upload bukti transfer"}
          </span>
          <span className="text-[11px] text-gray-400">JPG, PNG, WEBP — maksimal 5MB</span>
        </label>
      )}

      {uploadError && <p className="text-xs text-red-600 font-medium">{uploadError}</p>}
    </div>
  );
}

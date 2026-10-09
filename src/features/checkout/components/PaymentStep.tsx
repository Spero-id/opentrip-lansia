"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { usePaymentAccounts } from "@/features/checkout";
import BookingSummary from "./BookingSummary";
import PriceBreakdown from "./PriceBreakdown";
import Image from "next/image";
import { Upload } from "lucide-react";
import {
  availableMethods,
  findAccountByMethod,
  isCompleteAccount,
  resolveActiveMethod,
} from "@/features/payment/payment-account";
import type { AccountsStatus, PaymentAccountLike } from "@/features/payment/payment-account";
import type { useCheckout } from "@/features/checkout";

export default function PaymentStep({
  checkout,
  onPay,
  onBack,
}: {
  checkout: ReturnType<typeof useCheckout>;
  onPay: () => void;
  onBack: () => void;
}) {
  const { accounts, status: accountsStatus } = usePaymentAccounts();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
      <div className="lg:col-span-3 space-y-6">
        <BookingSummary destination={checkout.destination} />
        <PaymentSelector
          paymentMethod={checkout.paymentMethod}
          setPaymentMethod={checkout.setPaymentMethod}
          accounts={accounts}
          status={accountsStatus}
        />
        <ProofUploader checkout={checkout} />

        {checkout.error && (
          <div className="p-4 rounded-xl bg-destructive-50 border border-destructive-200 text-sm text-destructive-700">
            {checkout.error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={onPay}
            disabled={
              !checkout.paymentMethod ||
              !checkout.proofUrl ||
              checkout.isLoading ||
              accountsStatus === "loading"
            }
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          discount={checkout.discount}
          total={checkout.total}
          appliedVoucher={checkout.appliedVoucher}
          hideTerms
        />
      </div>
    </div>
  );
}

function PaymentSelector({
  paymentMethod,
  setPaymentMethod,
  accounts,
  status,
}: {
  paymentMethod?: string | null;
  setPaymentMethod?: (method: string | null) => void;
  accounts: PaymentAccountLike[];
  status: AccountsStatus;
}) {
  const bcaAccount = findAccountByMethod(accounts, "BCA");

  const visible = availableMethods(accounts, status);
  const showBCA = visible?.includes("BCA") ?? false;
  const selected = resolveActiveMethod(paymentMethod, visible);

  useEffect(() => {
    if (!visible) return;
    if (!visible.includes(paymentMethod ?? "")) {
      setPaymentMethod?.(visible[0] ?? null);
    }
  }, [visible, paymentMethod, setPaymentMethod]);

  const isBCA = selected === "BCA";
  const isQRIS = selected === "QRIS";

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-foreground">Metode Pembayaran</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pilih salah satu metode pembayaran di bawah ini.
        </p>
      </div>

      <div className="space-y-3">
        {status === "loading" && (
          <div
            aria-hidden="true"
            className="flex items-center justify-between rounded-xl border border-border bg-muted p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-9 rounded bg-border" />
              <div className="space-y-1.5">
                <div className="h-3 w-12 rounded bg-border" />
                <div className="h-2.5 w-24 rounded bg-border" />
              </div>
            </div>
            <div className="h-5 w-5 rounded-full border-2 border-border" />
          </div>
        )}

        {showBCA && (
          <label
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition"
            onClick={() => setPaymentMethod?.("BCA")}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-9 flex items-center justify-center">
                <Image src="https://vectorseek.com/wp-content/uploads/2022/07/vectorseek.com-BCA-Bank-Logo-Vector.png" alt="BCA" width={62} height={62} className="object-contain max-h-9" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">BCA</p>
                <p className="text-[11px] text-muted-foreground">Transfer Bank BCA</p>
              </div>
            </div>
            <span className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isBCA ? "var(--primary)" : "transparent", border: isBCA ? "none" : "2px solid var(--border)" }}
            >
              {isBCA && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          </label>
        )}

        {showBCA && isBCA && bcaAccount && isCompleteAccount(bcaAccount) && (
          <AccountCard account={bcaAccount} />
        )}

        <label
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition"
          onClick={() => setPaymentMethod?.("QRIS")}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-9 flex items-center justify-center">
              <Image
                src="/logo_qris.webp"
                alt="QRIS"
                width={62}
                height={62}
                className="object-contain max-h-9"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">QRIS</p>
              <p className="text-[11px] text-muted-foreground">Scan QRIS untuk pembayaran</p>
            </div>
          </div>
          <span className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: isQRIS ? "var(--primary)" : "transparent", border: isQRIS ? "none" : "2px solid var(--border)" }}
          >
            {isQRIS && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </label>

        {isQRIS && (
          <div className="rounded-xl border border-border bg-muted p-4 text-center">
            <p className="text-xs font-semibold text-muted-foreground mb-2">QR Code QRIS</p>
            <Image
              src="/qris_sivarya.jpeg"
              alt="QRIS QR Code"
              width={200}
              height={200}
              className="mx-auto object-contain rounded-lg bg-card p-2"
            />
            <p className="text-[11px] text-muted-foreground mt-2">Scan kode QR di atas menggunakan aplikasi e-wallet/banking</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountCard({ account }: { account: PaymentAccountLike }) {
  const [copied, setCopied] = useState(false);

  const bankName = String(account.bankName ?? "").trim();
  const accountHolder = String(account.accountHolder ?? "").trim();
  const accountNumber = String(account.accountNumber ?? "").trim();

  const copy = async () => {
    if (!accountNumber) return;
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  if (!bankName && !accountHolder && !accountNumber) return null;

  return (
    <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4 space-y-2">
      <p className="text-xs font-bold text-foreground">Transfer ke:</p>
      {bankName && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Bank</span>
          <span className="font-semibold text-foreground">{bankName}</span>
        </div>
      )}
      {accountHolder && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Atas Nama</span>
          <span className="font-semibold text-foreground">{accountHolder}</span>
        </div>
      )}
      {accountNumber && (
        <div className="flex justify-between gap-2 text-xs bg-card rounded-lg px-3 py-2">
          <span className="text-muted-foreground">Nomor</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary-foreground tracking-wide">{accountNumber}</span>
            <button
              onClick={copy}
              className="text-[11px] font-semibold text-secondary-foreground hover:underline"
            >
              {copied ? "Tersalin" : "Salin"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProofUploader({ checkout }: { checkout: ReturnType<typeof useCheckout> }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
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
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-foreground">Bukti Transfer</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upload bukti transfer senilai total pembayaran di atas.
        </p>
      </div>

      {checkout.proofUrl ? (
        <div className="space-y-2">
          <img
            src={checkout.proofUrl}
            alt="Bukti transfer"
            className="w-full max-h-64 object-contain rounded-xl border border-border bg-muted"
          />
          <button
            onClick={removeProof}
            className="text-xs font-semibold text-destructive-600 hover:underline"
          >
            Hapus Bukti
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {uploading ? (
            <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
          <span className="text-xs font-semibold text-muted-foreground">
            {uploading ? "Mengupload..." : "Klik untuk upload bukti transfer"}
          </span>
          <span className="text-[11px] text-muted-foreground">JPG, PNG, WEBP — maksimal 5MB</span>
        </label>
      )}

      {uploadError && <p className="text-xs text-destructive-600 font-medium">{uploadError}</p>}
    </div>
  );
}

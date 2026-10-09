"use client";

import { useState } from "react";
import Modal from "./modal";
import { Loader2 } from "lucide-react";

interface ConfirmActionProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmClassName?: string;
}

export default function ConfirmAction({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Ya, Lanjutkan",
  confirmClassName = "rounded-xl bg-success-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-success-700 transition disabled:opacity-50 inline-flex items-center gap-2",
}: ConfirmActionProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={confirmClassName}
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? "Memproses..." : confirmLabel}
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition disabled:opacity-50"
        >
          Batal
        </button>
      </div>
    </Modal>
  );
}

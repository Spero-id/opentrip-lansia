"use client";

import { useRef, useState } from "react";

interface BlogCoverUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function BlogCoverUploader({ value, onChange }: BlogCoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar.");
      // Hapus file sampul lama jika diganti
      if (value && value.startsWith("/uploads/")) {
        fetch(`/api/upload?url=${encodeURIComponent(value)}`, { method: "DELETE" }).catch(() => {});
      }
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove() {
    if (value && value.startsWith("/uploads/")) {
      fetch(`/api/upload?url=${encodeURIComponent(value)}`, { method: "DELETE" }).catch(() => {});
    }
    onChange(null);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Gambar Sampul</label>

      {value ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden w-full max-w-xs">
          <img src={value} alt="" className="w-full h-40 object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-[10px] font-semibold text-white bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 transition disabled:opacity-50"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={remove}
              className="text-[10px] font-semibold text-white bg-red-500/80 hover:bg-red-600 rounded-lg px-2 py-1 transition"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full max-w-xs rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400 hover:bg-slate-50 transition disabled:opacity-50"
        >
          {uploading ? "Mengunggah..." : "+ Unggah Gambar Sampul"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

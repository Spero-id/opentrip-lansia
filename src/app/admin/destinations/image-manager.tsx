"use client";

import { useRef, useState } from "react";

interface ImageManagerProps {
  cover: string | null;
  images: string[];
  onChange: (next: { cover: string | null; images: string[] }) => void;
}

export default function ImageManager({ cover, images, onChange }: ImageManagerProps) {
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
      const nextImages = [...images, data.url];
      onChange({ cover: cover ?? data.url, images: nextImages });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function setCover(url: string) {
    onChange({ cover: url, images });
  }

  function remove(url: string) {
    const nextImages = images.filter((img) => img !== url);
    const nextCover = cover === url ? nextImages[0] ?? null : cover;
    onChange({ cover: nextCover, images: nextImages });
    if (url.startsWith("/uploads/")) {
      fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" }).catch(() => {});
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Gambar Destinasi</label>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url) => (
            <div key={url} className="relative rounded-xl border border-slate-200 overflow-hidden group">
              <img src={url} alt="" className="w-full h-28 object-cover" />
              {cover === url && (
                <span className="absolute top-2 left-2 bg-[#F49D1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Sampul
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2">
                <button
                  type="button"
                  onClick={() => setCover(url)}
                  className="text-[10px] font-semibold text-white bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 transition"
                >
                  Jadikan Sampul
                </button>
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="text-[10px] font-semibold text-white bg-red-500/80 hover:bg-red-600 rounded-lg px-2 py-1 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          Belum ada gambar. Unggah gambar destinasi di bawah.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          {uploading ? "Mengunggah..." : "+ Unggah Gambar"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

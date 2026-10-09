"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";

interface CoverImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function CoverImageUploader({ value, onChange }: CoverImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function deleteStored(url: string | null) {
    if (url && url.startsWith("/uploads/")) {
      fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" }).catch(() => {});
    }
  }

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
      deleteStored(value);
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    deleteStored(value);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">Gambar Sampul</label>

      {value ? (
        <div className="relative rounded-xl border border-border overflow-hidden group max-w-sm">
          <img src={value} alt="Sampul blog" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            title="Hapus gambar sampul"
            className="absolute top-2 right-2 p-2 bg-foreground/60 hover:bg-destructive-600 text-background rounded-full transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="max-w-sm w-full rounded-xl border-2 border-dashed border-border p-8 flex flex-col items-center gap-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary-foreground transition disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          <span>{uploading ? "Mengunggah..." : "Unggah gambar sampul"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />
      {error && <p className="text-xs font-medium text-destructive-600">{error}</p>}
    </div>
  );
}
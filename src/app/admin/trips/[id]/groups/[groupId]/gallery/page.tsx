"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface Trip {
  id: string;
  title: string;
}

interface Group {
  id: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  status: string;
  isActive: boolean | null;
}

interface Gallery {
  id: string;
  tripId: string;
  departureId: string | null;
  title: string | null;
  description: string | null;
  isPrivate: boolean | null;
  createdAt: string;
}

interface GalleryMedia {
  id: string;
  galleryId: string;
  mediaId: string;
  uploadedBy: string;
  sortOrder: number | null;
  createdAt: string;
  url?: string;
}

interface MediaItem {
  id: string;
  url: string;
  filename: string;
}

function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  const [y, m, d] = val.slice(0, 10).split("-");
  if (!y || !m || !d) return val;
  return `${d}-${m}-${y}`;
}

export default function AdminGroupGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const groupId = params.groupId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [tripId, groupId]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // Fetch trip info
      const tripRes = await fetch(`/api/trips/${tripId}`);
      if (tripRes.ok) {
        const tripData = await tripRes.json();
        setTrip({ id: tripData.id, title: tripData.title });
      }

      // Fetch group info
      const groupsRes = await fetch(`/api/trips/${tripId}/groups`);
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        const foundGroup = groupsData.groups?.find((g: Group) => g.id === groupId);
        if (foundGroup) setGroup(foundGroup);
      }

      // Fetch gallery for this group
      const galleryRes = await fetch(`/api/trips/${tripId}/groups/${groupId}/gallery`);
      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        setGallery(galleryData.gallery);
        setMedia(galleryData.media || []);
      } else if (galleryRes.status === 404) {
        // No gallery yet, that's OK
        setGallery(null);
        setMedia([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  }, []);

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    try {
      // First, create gallery if it doesn't exist
      let galleryId = gallery?.id;
      if (!galleryId) {
        const createRes = await fetch(`/api/trips/${tripId}/groups/${groupId}/gallery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Foto Trip - ${formatDate(group?.startDate)}`,
            isPrivate: false,
          }),
        });
        if (!createRes.ok) {
          throw new Error("Gagal membuat galeri");
        }
        const createData = await createRes.json();
        galleryId = createData.gallery.id;
        setGallery(createData.gallery);
      }

      // Upload each file
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          console.error("Failed to upload file:", file.name);
          continue;
        }

        const uploadData = await uploadRes.json();

        // Add media to gallery
        await fetch(`/api/trips/${tripId}/groups/${groupId}/gallery/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaId: uploadData.id,
          }),
        });
      }

      // Refresh data
      await fetchData();
      setUploadOpen(false);
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    if (!confirm("Hapus foto ini?")) return;

    try {
      const res = await fetch(`/api/trips/${tripId}/groups/${groupId}/gallery/media/${mediaId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Gagal menghapus");
      }
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus foto");
    }
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
            onClick={() => router.push(`/admin/trips/${tripId}/groups`)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Galeri Foto Grup
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {trip?.title || "Trip"} — {formatDate(group?.startDate)} s/d {formatDate(group?.endDate)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Foto</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {media.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Belum ada foto</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Upload foto-foto dari trip grup ini. Foto akan tersimpan dan bisa dilihat oleh peserta.
          </p>
          <button
            onClick={() => setUploadOpen(true)}
            className="mt-6 px-6 py-3 bg-[#F49D1A] text-white rounded-2xl text-sm font-semibold hover:bg-[#c47d12] transition inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Foto Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden aspect-square"
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !uploading && setUploadOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Upload Foto</h2>
              {!uploading && (
                <button
                  onClick={() => {
                    setUploadOpen(false);
                    setSelectedFiles([]);
                    setPreviewUrls([]);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pilih Foto (bisa multiple)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#F49D1A]/10 file:text-[#F49D1A] hover:file:bg-[#F49D1A]/20"
                />
              </div>

              {previewUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Preview ({selectedFiles.length} foto)
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="rounded-xl bg-[#F49D1A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengupload...
                    </span>
                  ) : (
                    `Upload ${selectedFiles.length} Foto`
                  )}
                </button>
                {!uploading && (
                  <button
                    onClick={() => {
                      setUploadOpen(false);
                      setSelectedFiles([]);
                      setPreviewUrls([]);
                    }}
                    className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

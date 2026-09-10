"use client";

import { useState, useEffect } from "react";
import { X, Download, Image as ImageIcon, Loader2 } from "lucide-react";

export default function GalleryModal({ open, onClose, tripId, departureId, groupLabel }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (!open || !tripId || !departureId) return;

    async function fetchGallery() {
      setLoading(true);
      try {
        const res = await fetch(`/api/trips/${tripId}/groups/${departureId}/gallery`);
        if (res.ok) {
          const data = await res.json();
          setMedia(data.media || []);
        } else {
          setMedia([]);
        }
      } catch {
        setMedia([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, [open, tripId, departureId]);

  const handleDownload = async (url, filename) => {
    setDownloading(url);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "foto-trip.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(url, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Foto Trip</h2>
            {groupLabel && (
              <p className="text-xs text-gray-500 mt-0.5">{groupLabel}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#F49D1A]" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Belum ada foto</h3>
              <p className="text-sm text-gray-500 mt-2">Admin belum mengupload foto untuk grup ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200"
                >
                  {item.url ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  {/* Download overlay */}
                  {item.url && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleDownload(item.url, `foto-trip-${item.id}.jpg`)}
                        disabled={downloading === item.url}
                        className="p-3 bg-white/90 rounded-xl shadow-lg hover:bg-white transition disabled:opacity-50"
                      >
                        {downloading === item.url ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#F49D1A]" />
                        ) : (
                          <Download className="w-5 h-5 text-gray-700" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {media.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              {media.length} foto • Klik ikon download untuk menyimpan foto
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

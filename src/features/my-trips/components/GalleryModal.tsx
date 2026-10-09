"use client";

import { X, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { useGalleryModal } from "@/features/my-trips";

export default function GalleryModal({
  open,
  onClose,
  tripId,
  departureId,
  groupLabel,
}: {
  open: boolean;
  onClose: () => void;
  tripId?: string | null;
  departureId?: string | null;
  groupLabel?: string | null;
}) {
  const { media, loading, downloading, download } = useGalleryModal(tripId, departureId, open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <div className="relative bg-card rounded-3xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Foto Trip</h2>
            {groupLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{groupLabel}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Belum ada foto</h3>
              <p className="text-sm text-muted-foreground mt-2">Admin belum mengupload foto untuk grup ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border"
                >
                  {item.url ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {item.url && (
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => download(item.url ?? "", `foto-trip-${item.id}.jpg`)}
                        disabled={downloading === item.url}
                        className="p-3 bg-white/90 rounded-xl shadow-lg hover:bg-card transition disabled:opacity-50"
                      >
                        {downloading === item.url ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                        ) : (
                          <Download className="w-5 h-5 text-foreground" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {media.length > 0 && (
          <div className="px-6 py-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              {media.length} foto • Klik ikon download untuk menyimpan foto
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

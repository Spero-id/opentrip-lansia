import { useEffect, useState } from "react";
import { toPublicError } from "@/lib/errors/to-public-error";
import { downloadMedia, fetchGalleryMedia } from "@/features/my-trips";
import type { GalleryMedia } from "@/features/my-trips";

export function useGalleryModal(tripId: string | null | undefined, departureId: string | null | undefined, open: boolean) {
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !tripId || !departureId) return;
    let cancelled = false;
    setLoading(true);
    fetchGalleryMedia(tripId, departureId)
      .then((items) => {
        if (!cancelled) {
          setMedia(items);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMedia([]);
          setError(toPublicError(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, tripId, departureId]);

  const download = async (url: string, filename?: string) => {
    setDownloading(url);
    try {
      await downloadMedia(url, filename);
    } catch {
      window.open(url, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  return { media, loading, downloading, error, download };
}

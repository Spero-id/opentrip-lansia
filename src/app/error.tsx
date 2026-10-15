"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorState
      error={error}
      retry={retry}
      title="Maaf, terjadi kesalahan tak terduga"
      description="Permintaanmu tidak bisa diproses. Coba lagi, atau buka beranda."
      href="/"
      hrefLabel="Ke Beranda"
    />
  );
}

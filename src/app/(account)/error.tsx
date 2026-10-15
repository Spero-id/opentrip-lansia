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
      title="Maaf, halaman akun gagal dimuat"
      href="/profile"
      hrefLabel="Ke Profil"
    />
  );
}

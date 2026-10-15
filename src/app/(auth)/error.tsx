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
      title="Maaf, halaman gagal dimuat"
      href="/login"
      hrefLabel="Ke Login"
    />
  );
}

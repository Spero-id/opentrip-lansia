"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">Terjadi kesalahan</p>
      <h1 className="text-2xl font-semibold tracking-tight">Maaf, halaman gagal dimuat</h1>
      <div className="mt-2 flex gap-2">
        <Button onClick={() => retry()}>Coba Lagi</Button>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Ke Login
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">Kode: {error.digest}</p>
      ) : null}
    </div>
  );
}

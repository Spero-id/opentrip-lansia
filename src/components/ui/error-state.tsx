"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

interface ErrorStateProps {
  error: Error & { digest?: string };
  retry: () => void;
  title: string;
  href: string;
  hrefLabel: string;
  description?: string;
}

export function ErrorState({
  error,
  retry,
  title,
  href,
  hrefLabel,
  description,
}: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">Terjadi kesalahan</p>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <Button onClick={() => retry()}>Coba Lagi</Button>
        <Link href={href} className={buttonVariants({ variant: "outline" })}>
          {hrefLabel}
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">Kode: {error.digest}</p>
      ) : null}
    </div>
  );
}

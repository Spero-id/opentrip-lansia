import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Berita & Artikel Open Trip Lansia",
  description:
    "Info terbaru seputar open trip, destinasi ramah lansia, dan layanan OpenTrip Lansia.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}

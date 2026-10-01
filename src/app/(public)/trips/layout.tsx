import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Semua Destinasi Open Trip Lansia",
  description:
    "Jelajahi semua destinasi open trip ramah lansia di Indonesia — filter berdasarkan kategori, lokasi, harga, dan aksesibilitas.",
};

export default function TripsLayout({ children }: { children: ReactNode }) {
  return children;
}

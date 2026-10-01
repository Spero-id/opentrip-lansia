import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Private Trip | Jelajah Memoria",
  description: "Rancang private trip untuk rombongan Anda — isi form dan tim kami hubungi dalam 1x24 jam.",
};

export default function PrivateTripLayout({ children }: { children: ReactNode }) {
  return children;
}

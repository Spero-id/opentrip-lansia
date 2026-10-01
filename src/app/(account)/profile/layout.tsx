import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Profil | Jelajah Memoria",
  description: "Kelola profil, poin loyalitas, dan kode referral Anda.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}

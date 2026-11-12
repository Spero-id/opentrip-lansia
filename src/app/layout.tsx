import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nunito } from "next/font/google";
import "./globals.css";

// Nunito is a variable font (wght 200-1000), so no explicit weight list is
// needed - next/font serves the full variable range and every font-weight
// utility (400-800) resolves from the single variable file.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jelajah Memoria",
  description: "Platform open trip terpercaya untuk perjalanan wisata impian Anda.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${nunito.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

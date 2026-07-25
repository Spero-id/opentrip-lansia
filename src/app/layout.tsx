import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ConditionalFooter } from "@/components/conditional-footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenTrip — Discover The Best Destinations In The World",
  description: "Platform pemesanan open trip profesional, aman, dan terpercaya untuk seluruh perjalanan wisata impian Anda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-white text-slate-900 font-sans antialiased flex flex-col justify-between">
        <div>
          <Navbar />
          {children}
        </div>
        <ConditionalFooter />
      </body>
    </html>
  );
}

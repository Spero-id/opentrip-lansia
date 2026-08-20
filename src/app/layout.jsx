import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Jelajah Memoria",
  description: "Platform open trip terpercaya untuk perjalanan wisata impian Anda.",
  icons: {
    icon: "/Jelajah-Memoria-01.png",
    shortcut: "/Jelajah-Memoria-01.png",
    apple: "/Jelajah-Memoria-01.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    fetch("/api/trips")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const active = data.filter((d) => d.status === "published");
        const sorted = [...active].sort(
          (a, b) =>
            (b.reviewCount ?? 0) - (a.reviewCount ?? 0) ||
            (a.title || "").localeCompare(b.title || "")
        );
        setPopular(sorted.slice(0, 5));
      })
      .catch(() => { });
  }, []);
  return (
    <footer className="relative bg-[#0B0F19] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold mb-4">
              <img src="/Jelajah-Memoria-01.png" alt="Jelajah Memoria" className="h-16 w-auto" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Platform open trip terpercaya buat kamu yang mau explore
              destinasi terbaik di Indonesia dengan harga terjangkau.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/jelajahmemoria/"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F49D1A] hover:border-[#F49D1A] transition-colors"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/jelajahmemoria"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F49D1A] hover:border-[#F49D1A] transition-colors"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@jelajahmemoria"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F49D1A] hover:border-[#F49D1A] transition-colors"
                aria-label="Tiktok"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <p className="font-semibold text-sm tracking-wide mb-5">
              NAVIGASI
            </p>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="/" className="hover:text-[#F49D1A] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/trips" className="hover:text-[#F49D1A] transition-colors">
                  Destinasi
                </Link>
              </li>
              <li>
                <Link href="/private" className="hover:text-[#F49D1A] transition-colors">
                  Private Trip
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#F49D1A] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F49D1A] transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-sm tracking-wide mb-5">
              DESTINASI POPULER
            </p>
            <ul className="space-y-3 text-sm text-white/60">
              {popular.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/trips/${d.id}`}
                    className="hover:text-[#F49D1A] transition-colors"
                  >
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-sm tracking-wide mb-5">
              HUBUNGI KAMI
            </p>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F49D1A] shrink-0 mt-0.5">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Jl. Ratu Bidadari 3 no 2, Ciputat, Tangerang Selatan</span>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F49D1A] shrink-0">
                  <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.578 1.238l-.466.397a1 1 0 0 0-.302 1.212 12.06 12.06 0 0 0 6.178 6.121" />
                </svg>
                <a href="tel:+6281234567890" className="hover:text-[#F49D1A] transition-colors">
                  +62 851-1051-1403
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F49D1A] shrink-0">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <a href="mailto:jelajahmemoria@gmail" className="hover:text-[#F49D1A] transition-colors">
                  jelajahmemoria@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Jelajah Memoria. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="#" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </div>
    </footer >
  );
}

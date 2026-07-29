"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Beranda", href: "/" },
    { name: "Destinasi Trip", href: "/trips" },
    { name: "Private Trip", href: "/private" },
    { name: "Tentang Kami", href: "/about" },
    { name: "Hubungi Kami", href: "/contact" },
  ];

  return (
    <nav
      className={`w-full sticky top-0 z-50 text-black transition-all duration-300 ${isScrolled
          ? "bg-black/50 backdrop-blur-md shadow-lg border-b border-white/10"
          : "bg-white backdrop-blur-sm border-b border-transparent text-black"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="shrink-0">
            <Link
              href="/"
              className={`flex items-center gap-2 text-xl font-bold transition-colors ${isScrolled ? "text-gray-900" : "text-black"
                }`}
            >
              <img src="/Jelajah-Memoria-01.png" alt="Jelajah Memoria" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="ml-auto md:flex items-center justify-end space-x-8">
            {links.map((link) => (
              <Link

                key={link.name}
                href={link.href}
                className={`font-medium hidden md:flex transition-colors text-sm ${isScrolled
                    ? "text-white hover:text-[#df7224]"
                    : "text-black hover:text-[#df7224]"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-2">
              <Link
                href="/register"
                className="bg-[#df7224] hover:shadow-xl text-white px-5 py-2 rounded-[5px] text-sm font-poppins hover:bg-[#df7224]/80 transition-colors shadow-sm"
              >
                Register
              </Link>
              <Link
                href="/login"
                className={`px-5 py-2 hover:shadow-xl rounded-[5px] text-sm font-poppins transition-colors shadow-sm ${isScrolled
                    ? "bg-white border border-[#df7224] text-[#df7224] hover:bg-[#df7224] hover:text-white"
                    : "bg-white/10 border border-[#df7224] text-[#df7224] backdrop-blur-sm hover:bg-white hover:text-[#df7224]"
                  }`}
              >
                Login
              </Link>

            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-colors ${isScrolled ? "text-white" : "text-black"
                }`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"
          } ${isScrolled ? "bg-white" : "bg-black/80 backdrop-blur-md"}`}
      >
        <div className="px-4 pt-2 pb-4 space-y-1 border-t border-gray-100/20">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg font-medium text-sm transition-colors ${isScrolled
                  ? "text-gray-600 hover:bg-orange-50 hover:text-[#df7224]"
                  : "text-white hover:bg-white/10"
                }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="#hubungi"
            onClick={() => setIsOpen(false)}
            className="block mt-2 text-center bg-[#df7224] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#df7224]/80 transition-colors"
          >
            Hubungi Kami
          </Link>
        </div>
      </div>
    </nav>
  );
}

import Link from "next/link";
import { Compass, Mail, Phone, MapPin, Globe, Share2, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0b0f19] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
              <Compass className="h-7 w-7 text-[#e06d26]" />
              <span>Open<span className="text-[#e06d26]">Trip</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Platform pemesanan open trip terbaik untuk menjelajahi keindahan Indonesia dan dunia. Pengalaman berkesan dengan layanan profesional, aman, dan transparan.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" aria-label="Website" className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#e06d26] hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Social Share" className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#e06d26] hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Chat" className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#e06d26] hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Navigasi</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-[#e06d26] transition-colors">Beranda</Link></li>
              <li><Link href="/trips" className="hover:text-[#e06d26] transition-colors">Destinasi</Link></li>
              <li><Link href="/private-trip" className="hover:text-[#e06d26] transition-colors">Private Trip</Link></li>
              <li><Link href="/blog" className="hover:text-[#e06d26] transition-colors">Blog & Artikel</Link></li>
              <li><Link href="/#faq" className="hover:text-[#e06d26] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Destinasi Populer</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/trips?category=labuan-bajo" className="hover:text-[#e06d26] transition-colors">Labuan Bajo</Link></li>
              <li><Link href="/trips?category=kawah-ijen" className="hover:text-[#e06d26] transition-colors">Kawah Ijen</Link></li>
              <li><Link href="/trips?category=nusa-penida" className="hover:text-[#e06d26] transition-colors">Nusa Penida</Link></li>
              <li><Link href="/trips?category=danau-toba" className="hover:text-[#e06d26] transition-colors">Danau Toba</Link></li>
              <li><Link href="/trips?category=turkey" className="hover:text-[#e06d26] transition-colors">Cappadocia Turkey</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#e06d26] shrink-0 mt-0.5" />
                <span className="text-slate-400">Jl. M.H. Thamrin No. 12, Jakarta Pusat</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#e06d26] shrink-0" />
                <span className="text-slate-400">+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#e06d26] shrink-0" />
                <span className="text-slate-400">halo@opentrip.co.id</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} OpenTrip. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Home, Lock, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">403 Forbidden</h1>
        <p className="text-slate-500 mb-8">
          Upss, Halaman Tidak Di Temukan?.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl bg-[#df7224] text-white font-semibold hover:bg-[#df7224]/70 transition"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          
        </div>
      </div>
    </div>
  );
}
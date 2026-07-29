import Link from "next/link";
import { formatRupiah } from "@/lib/format";

const A = "#df7224";

export default function BookingCard({ dest }) {
  return (
    <div className="sticky top-28 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col gap-6">
      <div className="pb-6 border-b border-gray-100">
        <div className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">Mulai dari</div>
        <div className="text-3xl font-bold" style={{ color: A }}>
          {formatRupiah(dest.priceMin)}
        </div>
        <div className="text-sm text-gray-400 mt-1">per orang / pax</div>
      </div>

      <div className="pt-2">
        <Link href={`/checkout?destination=${dest.id}`} className="block w-full">
          <button
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-sm hover:shadow-lg transition-all cursor-pointer"
            style={{ backgroundColor: A }}
          >
            Pesan Sekarang
          </button>
        </Link>
        <p className="text-center text-xs text-gray-400 mt-4">Belum dipungut biaya saat ini.</p>
      </div>

      <div className="mt-2 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs font-semibold text-gray-600">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#df7224]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Bebas Reschedule
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#df7224]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Pemandu Lokal
        </div>
      </div>
    </div>
  );
}

import { formatNumber } from "@/lib/format";
import { Star } from "lucide-react";

export default function DestinationHeader({ dest }) {
  return (
    <div className="mb-4 sm:mb-6 mt-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
        <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-white bg-[#F49D1A]">
          {dest.category}
        </span>
        <span className="flex items-center gap-1 text-[#F49D1A] font-bold bg-[#FEF6E7] px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs">
          <Star className="w-3.5 h-3.5 fill-current" /> {dest.rating.toFixed(1)} <span className="text-gray-500 font-normal">({formatNumber(dest.reviewCount)} ulasan)</span>
        </span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-bold mb-2 tracking-tight text-gray-900">
        {dest.title}
      </h1>
      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 text-sm sm:text-lg font-medium">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-5 sm:h-5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {dest.location}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { MapPin, Star, ArrowRight, Heart } from "lucide-react";
import { formatRupiah } from "@/lib/formatRupiah";

export default function DestinationCard({ dest, onClick, className = "" }) {
  const ratingVal = typeof dest.rating === "number" ? dest.rating.toFixed(1) : "4.8";

  return (
    <Link
      href={`/trips/${dest.id}`}
      onClick={onClick}
      className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 ${className}`}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={dest.image}
          alt={dest.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-xs">
          <Star size={12} className="text-[#F49D1A] fill-[#F49D1A]" />
          <span className="text-xs font-semibold text-gray-900">
            {ratingVal}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap justify-end">
          {dest.isSeniorFriendly && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-teal-800 bg-teal-100/95 backdrop-blur-sm border border-teal-200 shadow-xs flex items-center gap-1">
              <Heart size={10} className="fill-teal-600 text-teal-600" />
              Ramah Lansia
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-[#F49D1A] shadow-xs">
            {dest.category || "Destinasi"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="flex items-center gap-1 text-xs text-gray-400 mb-1">
          <MapPin size={12} />
          {dest.location}
        </p>
        <h3 className="text-base font-bold text-gray-900 mb-4 line-clamp-1">
          {dest.title}
        </h3>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-[11px] text-gray-400">mulai dari</p>
            <p className="text-sm font-bold text-gray-900">
              {formatRupiah(dest.priceMin)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-[#F49D1A] flex items-center justify-center transition-colors flex-shrink-0">
            <ArrowRight
              size={16}
              className="text-gray-500 group-hover:text-white transition-colors"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

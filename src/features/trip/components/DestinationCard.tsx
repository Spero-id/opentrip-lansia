"use client";

import Link from "next/link";
import { MapPin, Star, ArrowRight, Heart } from "lucide-react";
import { formatIDR } from "@/utils/format";
import type { TripDetail } from "@/features/trip/types";

interface DestinationCardProps {
  dest: TripDetail;
  onClick?: () => void;
  className?: string;
}

export default function DestinationCard({ dest, onClick, className = "" }: DestinationCardProps) {
  const ratingVal = typeof dest.rating === "number" ? dest.rating.toFixed(1) : null;

  return (
    <Link
      href={`/trips/${dest.id}`}
      onClick={onClick}
      className={`group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-border transition-all duration-200 ${className}`}
    >
      <div className="relative h-44 overflow-hidden">
        {dest.image ? (
          <img
            src={dest.image}
            alt={dest.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-medium px-4 text-center">
            Gambar tidak tersedia
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-xs">
          {ratingVal ? (
            <>
              <Star size={12} className="text-primary-foreground fill-primary" />
              <span className="text-xs font-semibold text-foreground">{ratingVal}</span>
            </>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Belum ada ulasan</span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap justify-end">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-primary-foreground bg-primary shadow-xs">
            {dest.category || "Destinasi"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <MapPin size={12} />
          {dest.location}
        </p>
        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-1">
          {dest.title}
        </h3>
        <div className="h-6 mb-3 flex items-center">
          {dest.isSeniorFriendly && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 flex items-center gap-1 w-max">
              <Heart size={10} className="fill-teal-600 text-teal-600" />
              Ramah Lansia
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-[11px] text-muted-foreground">mulai dari</p>
            <p className="text-sm font-bold text-foreground">
              {formatIDR(dest.priceMin)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-muted group-hover:bg-primary flex items-center justify-center transition-colors flex-shrink-0">
            <ArrowRight
              size={16}
              className="text-muted-foreground group-hover:text-primary-foreground transition-colors"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

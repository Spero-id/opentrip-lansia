"use client";

import { useState } from "react";

export default function DestinationGallery({ images, title, onOpenLightbox }) {
  const [mobileSlide, setMobileSlide] = useState(0);
  const validImages = (Array.isArray(images) ? images : []).filter(Boolean);
  const hiddenCount = validImages.length - 3;

  if (validImages.length === 0) {
    return (
      <div className="h-[30vh] min-h-[200px] md:h-[420px] lg:h-[500px] rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-medium px-4 text-center">
        Gambar tidak tersedia
      </div>
    );
  }

  const imagesList = validImages;
  const len = imagesList.length;

  return (
    <>
      <div className="md:hidden relative h-[30vh] min-h-[200px] rounded-3xl overflow-hidden">
        <img
          src={imagesList[mobileSlide] || imagesList[0]}
          alt={`${title} ${mobileSlide + 1}`}
          onClick={() => onOpenLightbox(mobileSlide)}
          className="w-full h-full object-cover cursor-pointer"
        />
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {mobileSlide + 1} / {len}
        </div>
        {len > 1 && (
          <button
            onClick={() => setMobileSlide((i) => (i - 1 + len) % len)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            aria-label="Sebelumnya"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {len > 1 && (
          <button
            onClick={() => setMobileSlide((i) => (i + 1) % len)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            aria-label="Berikutnya"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {imagesList.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${i === mobileSlide ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-4 gap-2 sm:gap-4 h-[420px] lg:h-[500px] overflow-hidden">
        <div className="col-span-3 h-full overflow-hidden">
          <img
            src={imagesList[0]}
            alt={`${title} 1`}
            onClick={() => onOpenLightbox(0)}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500 rounded-l-3xl"
          />
        </div>
        <div className="flex flex-col gap-2 sm:gap-4 h-full">
          <div className="flex-1 overflow-hidden rounded-tr-3xl">
            <img
              src={imagesList[1] || imagesList[0]}
              alt={`${title} 2`}
              onClick={() => onOpenLightbox(1)}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 overflow-hidden rounded-br-3xl relative">
            <img
              src={imagesList[2] || imagesList[0]}
              alt={`${title} 3`}
              onClick={() => onOpenLightbox(2)}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
            />
            {len > 3 && (
              <div
                className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                onClick={() => onOpenLightbox(3)}
              >
                <span className="text-white font-bold text-2xl">+{hiddenCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
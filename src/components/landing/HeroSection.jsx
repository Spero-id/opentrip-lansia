"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ModalsSlider from "./ModalsSlider";


export default function HeroSection() {

  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-cover bg-center min-h-screen flex items-center"
      style={{
        backgroundImage: "url('/hero-image-2.jpeg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <ModalsSlider />
        <div className="grid lg:grid-cols-2 gap-10 pt-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Discover The <br />
              Best Destinations <br />
              In The World
            </h1>

            <p className="text-white/80 mb-8 max-w-md leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
              elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus
              leo.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <div className="flex items-center gap-3 bg-white/10 px-4 w-auto py-1 rounded-2xl border cursor-pointer border-[#df7224]/20 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-[#df7224]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Location
                  </p>
                  <p className="text-xs text-white/70">
                    Where do you want to go?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-1 cursor-pointer rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-[#df7224]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Select Date
                  </p>
                  <p className="text-xs text-white/70">
                    When are you traveling?
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <div className="rounded-3xl overflow-hidden shadow-2xl relative group">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop"
                    alt="Hot air balloon"
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=350&fit=crop"
                    alt="Tropical bridge"
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden shadow-2xl relative group">
                  <img
                    src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=350&fit=crop"
                    alt="Beach walk"
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=500&fit=crop"
                    alt="Ocean view"
                    className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#df7224]/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

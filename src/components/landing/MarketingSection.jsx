"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ChevronDown,
} from "lucide-react";
import { features } from "@/lib/data";


export default function MarketingSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? -1 : i);
  };

  return (
    <section className="relative bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug mb-6 max-w-md">
              Kenapa Harus Pilih{" "}
              <span className="text-[#df7224]">OpenTrip Ini</span>?
            </h2>
            <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
              Kami bantu setiap perjalanan mu jadi lebih mudah, aman, dan
              terjangkau dari pemesanan sampai mu sampai di destinasi.
            </p>

            <div className="space-y-3 mb-10">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    className={`rounded-xl border transition-colors duration-300 ${isOpen
                        ? "border-[#df7224]/30 bg-[#df7224]/10 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                  >
                    <button
                      onClick={() => toggle(i)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-[#df7224]" : "bg-gray-100"
                          }`}
                      >
                        <Icon
                          size={20}
                          className={isOpen ? "text-white" : "text-gray-700"}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {feature.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {feature.desc}
                        </p>
                      </div>

                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? "bg-[#df7224] text-white rotate-180" : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        <ChevronDown size={16} />
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm text-gray-600 leading-relaxed px-5 pb-4 pt-1 pl-[4.75rem] border-t border-gray-300">
                          {feature.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="hidden md:block">
            <div className="rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=500&fit=crop"
                alt="Family on beach"
                className="w-full h-[420px] object-cover"
              />
            </div>

            <a
              href="#book"
              className="relative mt-6 flex items-center justify-center gap-3 rounded-2xl overflow-hidden h-20 group"
            >
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=200&fit=crop"
                alt="Book a trip"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center justify-center gap-3 px-6">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                  <ArrowDownToLine size={18} className="text-gray-900" />
                </div>
                <span className="text-white font-bold text-xl tracking-wide">
                  Book A Trip Now
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

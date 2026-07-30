"use client";

import { SlidersHorizontal, Search, X, MapPin, Calendar, } from "lucide-react";
import { useEffect, useState } from "react";

const POPULAR_LOCATIONS = [
  "Maluku",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Kalimantan Timur",
];

const TRENDING_DESTINATIONS = [
  {
    name: "Kepulauan Derawan",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop",
  },
  {
    name: "Raja Ampat",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=500&fit=crop",
  },
  {
    name: "Gunung Bromo",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=500&fit=crop",
  },
  {
    name: "Labuan Bajo",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=500&fit=crop",
  },
];

export default function ModalsSlider() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState("Lampung");

const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => setIsVisible(true), 10)
}

    const closeModal = () => {
        setIsVisible(false);
        setTimeout(() => setIsModalOpen (false) , 300)
    }

    useEffect (() => {
        document.body.style.overflow = isModalOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        }
    }, [isModalOpen]);

    return (
        <div>
            <div className="flex items-center justify-center px-4">
                <button
                    onClick={openModal}
                    className="flex w-full max-w-2xl items-center gap-3 rounded-2xl bg-white shadow-md hover:shadow-lg px-5 py-4 transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 border border-[#F49D1A] shrink-0">
                        <Search size={18} className="text-[#F49D1A]" />
                    </div>

                    <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 text-sm">Yuk Jelajahi Kami!</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Temukan Destinasi Mu Disini
                        </p>
                    </div>

                    <div className="w-px h-8 bg-gray-300 shrink-0" />

                    <SlidersHorizontal size={18} className="text-[#F49D1A] shrink-0" />
                </button>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-[100]">
                    <div
                        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={closeModal}
                    />

                    <div
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl overflow-hidden h-[80vh] flex flex-col transition-transform duration-300 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                            }`}
                    >
                        <div className="flex justify-center pt-3 pb-2 shrink-0 bg-white">
                            <div className="w-10 h-1.5 rounded-full bg-gray-200" />
                        </div>

                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
                            aria-label="Tutup"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-4 pb-8 space-y-4">
                            <div className="flex items-center gap-3 bg-white shadow-sm rounded-2xl px-5 py-4">
                                <Search size={20} className="text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Derawan...."
                                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                                />
                            </div>

                            <div className="bg-white rounded-2xl p-5 sm:p-6">
                                <p className="text-sm text-gray-400 mb-4">Sering dicari</p>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {POPULAR_LOCATIONS.map((loc) => {
                                        const isSelected = selectedLocation === loc;
                                        return (
                                            <button
                                                key={loc}
                                                onClick={() => setSelectedLocation(loc)}
                                                className={`flex items-center gap-2 text-left text-sm transition-colors ${isSelected ? "text-[#F49D1A]" : "text-gray-800 hover:text-[#F49D1A]"
                                                    }`}
                                            >
                                                <MapPin size={16} className={isSelected ? "text-[#F49D1A]" : "text-gray-400"} />
                                                {loc}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 sm:p-6">
                                <p className="font-bold text-gray-900 mb-4">Banyak dicari pengguna lain</p>
                                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                                    {TRENDING_DESTINATIONS.map((dest) => (
                                        <button
                                            key={dest.name}
                                            className="relative shrink-0 w-32 h-40 rounded-2xl overflow-hidden group"
                                        >
                                            <img
                                                src={dest.image}
                                                alt={dest.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold text-left">
                                                {dest.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

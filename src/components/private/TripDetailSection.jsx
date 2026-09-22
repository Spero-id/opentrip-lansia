"use client";

import { useState } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import SelectedDestination from "./SelectedDestination";
import DestinationModal from "./DestinationModal";

const TUJUAN_OPTIONS = [
  { value: "custom", label: "Destinasi Baru (Custom)" },
  { value: "explorer", label: "Modifikasi Paket Web" },
];

const TRANSPORT_OPTIONS = [
  {
    value: "all-in",
    title: "All-in dari Kota Asal",
    desc: "Termasuk tiket pesawat/kereta & transport selama trip",
  },
  {
    value: "local",
    title: "Transportasi Lokal Saja",
    desc: "Bertemu di kota tujuan (Land Arrangement), sewa Hiace/Bus",
  },
  {
    value: "self",
    title: "Bawa Kendaraan Sendiri",
    desc: "Hanya butuh hotel, guide, dan tiket masuk wisata",
  },
];

export default function TripDetailSection({ form, set, errors, destinationsData = [] }) {
  const baseInput =
    "w-full px-3 py-2.5 rounded-lg border text-[13px] leading-5 bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 transition-colors";
  const normalBorder = "border-[#D1D5DB] focus:border-[#F49D1A]";
  const errorBorder = "border-red-300 focus:border-red-400 focus:ring-red-100";
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local

  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState("");

  const filteredDestinations = destinationSearch.trim()
    ? destinationsData.filter((d) =>
        (d.title || d.name || "").toLowerCase().includes(destinationSearch.toLowerCase())
      )
    : destinationsData;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <h3 className="text-[14px] font-semibold text-[#1F2A37] flex items-center gap-2">
          <Calendar size={16} strokeWidth={1.8} color="#6B7280" className="shrink-0" />
          Detail Perjalanan
        </h3>
      </div>
      <div className="h-px bg-[#E5E7EB]" />

      {/* Body */}
      <div className="px-5 sm:px-6 py-5 space-y-5">
        {/* Tujuan Trip */}
        <div>
          <p className="text-[13px] font-medium text-[#374151]">
            Tujuan Trip <span className="text-[#DC2626]">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
            {TUJUAN_OPTIONS.map((opt) => {
              const active = form.tripType === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                    active
                      ? "border-[#F49D1A] bg-[#FFFBEB]/50"
                      : "border-[#D1D5DB] bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tujuanTrip"
                    value={opt.value}
                    checked={active}
                    onChange={() => set("tripType", opt.value)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      active ? "border-[#F49D1A] bg-white" : "border-[#D1D5DB] bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-[#F49D1A]" />}
                  </span>
                  <span
                    className={`text-[13px] ${active ? "text-[#1F2A37] font-medium" : "text-[#374151] font-normal"}`}
                  >
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Custom input */}
          {form.tripType === "custom" && (
            <div className="mt-1.5">
              <input
                id="field-customTripName"
                type="text"
                placeholder="Ketik destinasi tujuan Anda (Cth: Eksplorasi Bromo & Batu)"
                value={form.customTripName}
                onChange={(e) => set("customTripName", e.target.value)}
                className={`${baseInput} ${errors.customTripName ? errorBorder : normalBorder}`}
              />
              {errors.customTripName && (
                <p className="text-xs text-red-500 mt-1.5">{errors.customTripName}</p>
              )}
            </div>
          )}

          {/* Explorer picker — modal popup */}
          {form.tripType === "explorer" && (
            <div id="field-selectedDestinasi" className="mt-1.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDestinationModal(true)}
                  className={`${baseInput} pr-10 text-left cursor-pointer ${errors.selectedDestinasi ? errorBorder : normalBorder} ${!form.selectedDestinasi ? "text-[#9CA3AF]" : "text-[#1F2A37]"}`}
                >
                  <span className="flex-1 truncate">
                    {form.selectedDestinasi
                      ? `${form.selectedDestinasi.title || form.selectedDestinasi.name || ""}`
                      : "Pilih paket referensi..."}
                  </span>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] shrink-0" size={16} />
                </button>
              </div>
              {errors.selectedDestinasi && (
                <p className="text-xs text-red-500 mt-1.5">{errors.selectedDestinasi}</p>
              )}
              {form.selectedDestinasi && (
                <div className="mt-1.5">
                  <SelectedDestination
                    destination={form.selectedDestinasi}
                    onClear={() => set("selectedDestinasi", null)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Destination Modal */}
        {form.tripType === "explorer" && (
          <DestinationModal
            isOpen={showDestinationModal}
            onClose={() => {
              setShowDestinationModal(false);
              setDestinationSearch("");
            }}
            destinations={filteredDestinations}
            onSelect={(dest) => {
              set("selectedDestinasi", dest);
              setShowDestinationModal(false);
              setDestinationSearch("");
            }}
            searchValue={destinationSearch}
            onSearchChange={setDestinationSearch}
          />
        )}

        {/* Jumlah Peserta & Durasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="field-jumlahPeserta" className="text-[13px] font-medium text-[#374151]">
              Jumlah Peserta <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="field-jumlahPeserta"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                placeholder="Cth: 15"
                value={form.jumlahPeserta}
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, "").slice(0, 3);
                  if (digits === "") { set("jumlahPeserta", ""); return; }
                  let num = parseInt(digits, 10);
                  if (num > 100) num = 100;
                  set("jumlahPeserta", String(num));
                }}
                onKeyDown={(e) => {
                  if (e.ctrlKey || e.metaKey) return;
                  if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                  if (e.key.length === 1 && !/^\d$/.test(e.key)) e.preventDefault();
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  if (/[^\d]/.test(text)) {
                    e.preventDefault();
                    let digits = text.replace(/\D/g, "").slice(0, 3);
                    if (digits) {
                      let num = parseInt(digits, 10);
                      if (num > 100) num = 100;
                      set("jumlahPeserta", String(num));
                    }
                  }
                }}
                className={`${baseInput} pr-14 ${errors.jumlahPeserta ? errorBorder : normalBorder}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280] pointer-events-none">
                Orang
              </span>
            </div>
            {errors.jumlahPeserta && (
              <p className="text-xs text-red-500 mt-1.5">{errors.jumlahPeserta}</p>
            )}
          </div>

          <div>
            <label htmlFor="field-durasi" className="text-[13px] font-medium text-[#374151]">
              Durasi <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="field-durasi"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="Cth: 3"
                value={form.durasi}
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, "").slice(0, 2);
                  if (digits === "") { set("durasi", ""); return; }
                  let num = parseInt(digits, 10);
                  if (num > 30) num = 30;
                  set("durasi", String(num));
                }}
                onKeyDown={(e) => {
                  if (e.ctrlKey || e.metaKey) return;
                  if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                  if (e.key.length === 1 && !/^\d$/.test(e.key)) e.preventDefault();
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  if (/[^\d]/.test(text)) {
                    e.preventDefault();
                    let digits = text.replace(/\D/g, "").slice(0, 2);
                    if (digits) {
                      let num = parseInt(digits, 10);
                      if (num > 30) num = 30;
                      set("durasi", String(num));
                    }
                  }
                }}
                className={`${baseInput} pr-12 ${errors.durasi ? errorBorder : normalBorder}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280] pointer-events-none">
                Hari
              </span>
            </div>
            {errors.durasi && (
              <p className="text-xs text-red-500 mt-1.5">{errors.durasi}</p>
            )}
          </div>
        </div>

        {/* Tanggal & Titik Kumpul */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="field-tanggal" className="text-[13px] font-medium text-[#374151]">
              Tanggal Keberangkatan <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="field-tanggal"
                type="date"
                value={form.tanggal}
                min={todayStr}
                onChange={(e) => set("tanggal", e.target.value)}
                disabled={form.tanggalFleksibel}
                className={`${baseInput} ${form.tanggalFleksibel ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""} ${errors.tanggal ? errorBorder : normalBorder}`}
              />
            </div>
            <label className="inline-flex items-center gap-2 mt-1.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!form.tanggalFleksibel}
                onChange={(e) => set("tanggalFleksibel", e.target.checked)}
                className="sr-only"
              />
              <span
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  form.tanggalFleksibel
                    ? "bg-[#F49D1A] border-[#F49D1A]"
                    : "bg-white border-[#D1D5DB]"
                }`}
                aria-hidden="true"
              >
                {form.tanggalFleksibel && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </span>
              <span className="text-[11px] text-[#6B7280] group-hover:text-[#374151]">
                Tanggal belum pasti (Masih fleksibel)
              </span>
            </label>
            {errors.tanggal && (
              <p className="text-xs text-red-500 mt-1.5">{errors.tanggal}</p>
            )}
          </div>

          <div>
            <label htmlFor="field-meetingPoint" className="text-[13px] font-medium text-[#374151]">
              Titik Kumpul (Meeting Point) <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="field-meetingPoint"
              type="text"
              placeholder="Cth: Bandara / Stasiun kota asal"
              value={form.meetingPoint}
              onChange={(e) => set("meetingPoint", e.target.value)}
              className={`${baseInput} mt-1.5 ${errors.meetingPoint ? errorBorder : normalBorder}`}
            />
            {errors.meetingPoint && (
              <p className="text-xs text-red-500 mt-1.5">{errors.meetingPoint}</p>
            )}
          </div>
        </div>

        <div className="h-px bg-[#E5E7EB]" />

        {/* Kebutuhan Transportasi */}
        <div id="field-transportNeeds">
          <p className="text-[13px] font-medium text-[#374151]">
            Kebutuhan Transportasi <span className="text-[#DC2626]">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
            {TRANSPORT_OPTIONS.map((opt) => {
              const active = form.transportNeeds === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex-1 flex flex-col gap-1.5 px-4 py-3 rounded-lg border cursor-pointer transition-colors text-left ${
                    active
                      ? "border-[#F49D1A] bg-[#FFFBEB]/50"
                      : "border-[#D1D5DB] bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="transportNeeds"
                      value={opt.value}
                      checked={active}
                      onChange={() => set("transportNeeds", opt.value)}
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        active ? "border-[#F49D1A] bg-white" : "border-[#D1D5DB] bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {active && <span className="w-2 h-2 rounded-full bg-[#F49D1A]" />}
                    </span>
                    <span className="text-[12px] font-semibold text-[#1F2A37] leading-tight">
                      {opt.title}
                    </span>
                  </span>
                  <span className="text-[11px] leading-4 text-[#6B7280] pl-6">
                    {opt.desc}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.transportNeeds && (
            <p className="text-xs text-red-500 mt-1.5">{errors.transportNeeds}</p>
          )}
        </div>
      </div>
    </div>
  );
}

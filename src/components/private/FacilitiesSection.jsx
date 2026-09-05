"use client";

import { Info } from "lucide-react";

const STANDAR_OPTIONS = [
  { value: "", label: "Pilih standar penginapan..." },
  { value: "budget", label: "Budget / Homestay" },
  { value: "bintang3", label: "Hotel Bintang 3" },
  { value: "bintang4", label: "Hotel Bintang 4" },
  { value: "bintang5", label: "Hotel Bintang 5" },
  { value: "villa", label: "Villa / Resort" },
];

const LAYANAN_OPTIONS = [
  { key: "fotografer", label: "Fotografer / Video" },
  { key: "drone", label: "Kamera Drone" },
  { key: "gala", label: "Gala Dinner / BBQ" },
  { key: "tourLeader", label: "Tour Leader Khusus" },
];

export default function FacilitiesSection({ form, set, errors }) {
  const baseInput =
    "w-full px-3 py-2.5 rounded-lg border text-[13px] leading-5 bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 transition-colors";
  const normalBorder = "border-[#D1D5DB] focus:border-[#F49D1A]";
  const errorBorder = "border-red-300 focus:border-red-400 focus:ring-red-100";

  const budgetDisplay = (raw) => {
    if (raw === "" || raw == null) return "";
    const num = Number(String(raw).replace(/\D/g, ""));
    if (isNaN(num) || num === 0) return "";
    return num.toLocaleString("id-ID");
  };

  const toggleLayanan = (key) => {
    const current = form.layananTambahan || [];
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    set("layananTambahan", next);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <h3 className="text-[14px] font-semibold text-[#1F2A37] flex items-center gap-2">
          <Info size={16} strokeWidth={1.8} color="#6B7280" className="shrink-0" />
          Fasilitas, Preferensi &amp; Budget
        </h3>
      </div>
      <div className="h-px bg-[#E5E7EB]" />

      {/* Body */}
      <div className="px-5 sm:px-6 py-5 space-y-5">
        {/* Standar Penginapan */}
        <div>
          <label className="text-[13px] font-medium text-[#374151]">
            Standar Penginapan <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative mt-1.5">
            <select
              value={form.standarPenginapan || ""}
              onChange={(e) => set("standarPenginapan", e.target.value)}
              className={`${baseInput} pr-8 appearance-none cursor-pointer ${errors.standarPenginapan ? errorBorder : normalBorder} ${!form.standarPenginapan ? "text-[#9CA3AF]" : "text-[#1F2A37]"}`}
            >
              {STANDAR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
          {errors.standarPenginapan && (
            <p className="text-xs text-red-500 mt-1.5">{errors.standarPenginapan}</p>
          )}
        </div>

        {/* Layanan Tambahan */}
        <div>
          <p className="text-[13px] font-medium text-[#374151]">Layanan Tambahan (Opsional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
            {LAYANAN_OPTIONS.map((opt) => {
              const checked = (form.layananTambahan || []).includes(opt.key);
              return (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-[13px] cursor-pointer transition-colors ${
                    checked
                      ? "border-[#F49D1A] bg-[#FFFBEB]/60"
                      : "border-[#D1D5DB] bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLayanan(opt.key)}
                    className="sr-only"
                  />
                  <span
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      checked ? "bg-[#F49D1A] border-[#F49D1A]" : "bg-white border-[#D1D5DB]"
                    }`}
                    aria-hidden="true"
                  >
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </span>
                  <span className="text-[#374151] leading-none">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Catatan Kebutuhan Khusus */}
        <div>
          <label className="text-[13px] font-medium text-[#374151]">Catatan Kebutuhan Khusus</label>
          <textarea
            rows={3}
            placeholder="Ceritakan detail tambahan. Contoh: Ada peserta lansia/berkursi roda, request menu makanan khusus (halal/vegetarian), dsb."
            value={form.catatan || ""}
            onChange={(e) => set("catatan", e.target.value)}
            className={`${baseInput} mt-1.5 resize-none min-h-[84px] ${errors.catatan ? errorBorder : normalBorder}`}
          />
          {errors.catatan && (
            <p className="text-xs text-red-500 mt-1.5">{errors.catatan}</p>
          )}
        </div>

        {/* Estimasi Budget */}
        <div>
          <label className="text-[13px] font-medium text-[#374151]">Estimasi Budget (Per Orang)</label>
          <div className="relative mt-1.5 w-full sm:max-w-[300px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#6B7280]">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Kosongkan jika belum tahu"
              value={budgetDisplay(form.budget)}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                set("budget", raw);
              }}
              className={`${baseInput} pl-8 ${errors.budget ? errorBorder : normalBorder}`}
            />
          </div>
          {errors.budget && (
            <p className="text-xs text-red-500 mt-1.5">{errors.budget}</p>
          )}
        </div>

        {/* Pilih Metode Tindak Lanjut */}
        <div>
          <p className="text-[13px] font-medium text-[#374151]">
            Pilih Metode Tindak Lanjut <span className="text-[#DC2626]">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
            {[
              { value: "whatsapp", label: "Hubungi via WhatsApp" },
              { value: "email", label: "Kirim ke Email (Lebih formal)" },
            ].map((opt) => {
              const active = (form.metodeKontak || "whatsapp") === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                    active
                      ? "border-[#F49D1A] bg-[#FFFBEB] text-[#1F2A37] font-medium"
                      : "border-[#D1D5DB] text-[#374151] hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodeKontak"
                    value={opt.value}
                    checked={active}
                    onChange={() => set("metodeKontak", opt.value)}
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
                  <span className="text-[13px] leading-tight break-words">
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.metodeKontak && (
            <p className="text-xs text-red-500 mt-1.5">{errors.metodeKontak}</p>
          )}
        </div>
      </div>
    </div>
  );
}

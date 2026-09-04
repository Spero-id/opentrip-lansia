"use client";

import { User } from "lucide-react";

const TIPE_OPTIONS = [
  { value: "Individu", label: "Individu / Keluarga" },
  { value: "Perusahaan", label: "Perusahaan (Corporate)" },
  { value: "Sekolah/Universitas", label: "Sekolah / Kampus" },
];

export default function BookingInformationSection({ form, set, errors }) {
  const isInstitusi = form.tripFrom !== "Individu";
  const institusiLabel =
    form.tripFrom === "Perusahaan" ? "Nama Perusahaan" : "Nama Sekolah / Kampus";
  const institusiPlaceholder =
    form.tripFrom === "Perusahaan" ? "Cth: PT Maju Bersama" : "Cth: Universitas Indonesia";

  const baseInput =
    "w-full px-3 py-2.5 rounded-lg border text-[13px] leading-5 bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 transition-colors";
  const normalBorder = "border-[#D1D5DB] focus:border-[#F49D1A]";
  const errorBorder = "border-red-300 focus:border-red-400 focus:ring-red-100";

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <h3 className="text-[14px] font-semibold text-[#1F2A37] flex items-center gap-2">
          <User size={16} strokeWidth={1.8} color="#6B7280" className="shrink-0" />
          Informasi Pemesan
        </h3>
      </div>
      <div className="h-px bg-[#E5E7EB]" />

      {/* Body */}
      <div className="px-5 sm:px-6 py-5 space-y-5">
        {/* Tipe Pemesan */}
        <div>
          <p className="text-[13px] font-medium text-[#374151]">
            Tipe Pemesan <span className="text-[#DC2626]">*</span>
          </p>
          <fieldset className="mt-1.5 flex flex-col sm:flex-row gap-3">
            {TIPE_OPTIONS.map((opt) => {
              const active = form.tripFrom === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer group ${
                    active
                      ? "border-[#F49D1A] bg-[#FFFBEB] text-[#1F2A37] font-medium"
                      : "border-[#D1D5DB] text-[#374151] hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipePemesan"
                    value={opt.value}
                    checked={active}
                    onChange={() => {
                      set("tripFrom", opt.value);
                      if (opt.value === "Individu") {
                        set("namaInstitusi", "");
                      }
                    }}
                    className="sr-only"
                    aria-label={opt.label}
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
          </fieldset>
          {errors.tripFrom && (
            <p className="text-xs text-red-500 mt-1.5">{errors.tripFrom}</p>
          )}

          {isInstitusi && (
            <div className="mt-4">
              <label className="text-[13px] font-medium text-[#374151]">
                {institusiLabel} <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder={institusiPlaceholder}
                value={form.namaInstitusi}
                onChange={(e) => set("namaInstitusi", e.target.value)}
                className={`${baseInput} mt-1.5 ${errors.namaInstitusi ? errorBorder : normalBorder}`}
              />
              {errors.namaInstitusi && (
                <p className="text-xs text-red-500 mt-1.5">{errors.namaInstitusi}</p>
              )}
            </div>
          )}
        </div>

        {/* Nama & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-[13px] font-medium text-[#374151]">
              Nama Lengkap <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              placeholder="Cth: Budi Santoso"
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              className={`${baseInput} mt-1.5 ${errors.nama ? errorBorder : normalBorder}`}
            />
            {errors.nama && (
              <p className="text-xs text-red-500 mt-1.5">{errors.nama}</p>
            )}
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#374151]">
              No. WhatsApp <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="tel"
              placeholder="Cth: 081234567890"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={`${baseInput} mt-1.5 ${errors.phone ? errorBorder : normalBorder}`}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[13px] font-medium text-[#374151]">
            Email <span className="text-[#DC2626]">*</span>
          </label>
          <input
            type="email"
            placeholder="Cth: budi@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={`${baseInput} mt-1.5 ${errors.email ? errorBorder : normalBorder}`}
          />
          {errors.email ? (
            <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
          ) : (
            <p className="text-[11px] leading-4 text-[#9CA3AF] mt-1.5">
              Proposal &amp; detail penawaran akan dikirimkan ke email ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const HEALTH_CONDITIONS = [
  { key: "hypertension", label: "Hipertensi / Darah Tinggi" },
  { key: "diabetes", label: "Diabetes / Gula Darah" },
  { key: "heart", label: "Jantung" },
  { key: "asthma", label: "Asma / Gangguan Pernapasan" },
  { key: "vertigo", label: "Vertigo / Migrain Akut" },
  { key: "jointBone", label: "Gangguan Sendi / Keropos Tulang (Osteoporosis)" },
];

const MOBILITY_OPTIONS = [
  { value: "independent", label: "Tidak menggunakan alat bantu (Berjalan mandiri)" },
  { value: "walking_stick", label: "Tongkat jalan" },
  { value: "wheelchair", label: "Kursi roda (Akan didampingi keluarga sendiri)" },
];

export default function CustomerForm({ customer, setCustomer, onAutofill }) {
  const [showHealth, setShowHealth] = useState(false);

  const handleChange = (field) => (e) => {
    setCustomer(field, e.target.value);
  };

  const handleHealthToggle = (key) => {
    if (key === "none") {
      // If "none" is selected, uncheck all others
      const cleared = {};
      HEALTH_CONDITIONS.forEach((c) => (cleared[c.key] = false));
      setCustomer("healthConditions", { ...cleared, none: true });
    } else {
      const current = customer.healthConditions || {};
      const updated = { ...current, [key]: !current[key], none: false };
      setCustomer("healthConditions", updated);
    }
  };

  const handleMobilityChange = (value) => {
    setCustomer("mobilityOption", value);
  };

  return (
    <div className="space-y-5">
      {/* Nama Lengkap Peserta */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Nama Lengkap Peserta <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Nama sesuai identitas"
          value={customer.fullName || ""}
          onChange={handleChange("fullName")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20"
        />
      </div>

      {/* Tanggal Lahir */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Tanggal Lahir <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          value={customer.birthDate || ""}
          onChange={(e) => {
            const val = e.target.value;
            // Batasi panjang tahun max 4 digit
            if (val && val.split("-")[0] && val.split("-")[0].length > 4) return;
            setCustomer("birthDate", val);
          }}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20"
        />
      </div>

      {/* Nomor WhatsApp / HP */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Nomor WhatsApp / HP Aktif Peserta <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          placeholder="08xx-xxxx-xxxx"
          value={customer.phone || ""}
          onChange={handleChange("phone")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20"
        />
      </div>

      {/* Alamat Rumah */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Alamat Rumah Sekarang <span className="text-red-400">*</span>
        </label>
        <textarea
          placeholder="Alamat lengkap rumah Anda"
          value={customer.address || ""}
          onChange={handleChange("address")}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20 resize-none"
        />
      </div>

      {/* Kontak Darurat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Nama Kontak Darurat (Anak/Keluarga Terdekat) <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Nama kontak darurat"
            value={customer.emergencyContactName || ""}
            onChange={handleChange("emergencyContactName")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Nomor HP Kontak Darurat <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            value={customer.emergencyContactPhone || ""}
            onChange={handleChange("emergencyContactPhone")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20"
          />
        </div>
      </div>

      {/* Riwayat Penyakit Bawaan */}
      <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
        <label className="block text-xs font-semibold text-gray-500 mb-3">
          Riwayat Penyakit Bawaan <span className="text-red-400">*</span>
        </label>
        <div className="space-y-2.5">
          {HEALTH_CONDITIONS.map((condition) => {
            const checked = customer.healthConditions?.[condition.key] || false;
            return (
              <label
                key={condition.key}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleHealthToggle(condition.key)}
                  className="w-4 h-4 text-[#F49D1A] border-gray-300 rounded focus:ring-[#F49D1A]/20 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {condition.label}
                </span>
              </label>
            );
          })}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={customer.healthConditions?.none || false}
              onChange={() => handleHealthToggle("none")}
              className="w-4 h-4 text-[#F49D1A] border-gray-300 rounded focus:ring-[#F49D1A]/20 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              Tidak ada riwayat penyakit di atas
            </span>
          </label>
        </div>
      </div>

      {/* Daftar Obat-obatan */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Daftar Obat-obatan Pribadi yang Wajib Dikonsumsi
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Tuliskan jenis obat bawaan jika ada. Tulis &quot;Tidak ada&quot; jika tidak membawa obat khusus.
        </p>
        <textarea
          placeholder="Contoh: Amlodipine 5mg, Metformin 500mg"
          value={customer.medications || ""}
          onChange={handleChange("medications")}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20 resize-none"
        />
      </div>

      {/* Alat Bantu Mobilitas */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-3">
          Alat Bantu Mobilitas yang Digunakan (Jika Ada)
        </label>
        <div className="space-y-2.5">
          {MOBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="mobility"
                checked={(customer.mobilityOption || "independent") === option.value}
                onChange={() => handleMobilityChange(option.value)}
                className="w-4 h-4 text-[#F49D1A] border-gray-300 focus:ring-[#F49D1A]/20 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Autofill button for dev */}
      <button
        type="button"
        onClick={onAutofill}
        className="text-xs text-[#F49D1A] font-semibold hover:underline"
      >
        Isi data contoh (Autofill)
      </button>
    </div>
  );
}

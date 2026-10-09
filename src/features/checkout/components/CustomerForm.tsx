"use client";

import type { ChangeEvent } from "react";
import type { Customer } from "@/features/checkout";

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

export default function CustomerForm({
  customer,
  setCustomer,
  onAutofill,
}: {
  customer: Customer;
  setCustomer: (field: string, value: unknown) => void;
  onAutofill: () => void;
}) {
  const handleChange = (field: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer(field, e.target.value);
  };

  const handleHealthToggle = (key: string) => {
    if (key === "none") {
      const cleared: Record<string, boolean> = {};
      HEALTH_CONDITIONS.forEach((c) => (cleared[c.key] = false));
      setCustomer("healthConditions", { ...cleared, none: true });
    } else {
      const current = customer.healthConditions || {};
      const updated = { ...current, [key]: !current[key], none: false };
      setCustomer("healthConditions", updated);
    }
  };

  const handleMobilityChange = (value: string) => {
    setCustomer("mobilityOption", value);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          Nama Lengkap Peserta <span className="text-destructive-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Nama sesuai identitas"
          value={customer.fullName || ""}
          onChange={handleChange("fullName")}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          Tanggal Lahir <span className="text-destructive-400">*</span>
        </label>
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          value={customer.birthDate || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val && val.split("-")[0] && val.split("-")[0].length > 4) return;
            setCustomer("birthDate", val);
          }}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          Nomor WhatsApp / HP Aktif Peserta <span className="text-destructive-400">*</span>
        </label>
        <input
          type="tel"
          placeholder="08xx-xxxx-xxxx"
          value={customer.phone || ""}
          onChange={handleChange("phone")}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          Alamat Rumah Sekarang <span className="text-destructive-400">*</span>
        </label>
        <textarea
          placeholder="Alamat lengkap rumah Anda"
          value={customer.address || ""}
          onChange={handleChange("address")}
          rows={2}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Nama Kontak Darurat (Anak/Keluarga Terdekat) <span className="text-destructive-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Nama kontak darurat"
            value={customer.emergencyContactName || ""}
            onChange={handleChange("emergencyContactName")}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Nomor HP Kontak Darurat <span className="text-destructive-400">*</span>
          </label>
          <input
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            value={customer.emergencyContactPhone || ""}
            onChange={handleChange("emergencyContactPhone")}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="border border-border rounded-2xl p-4 bg-muted/50">
        <label className="block text-xs font-semibold text-muted-foreground mb-3">
          Riwayat Penyakit Bawaan <span className="text-destructive-400">*</span>
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
                  className="w-4 h-4 text-primary-foreground border-border rounded focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-foreground">
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
              className="w-4 h-4 text-primary-foreground border-border rounded focus:ring-primary/20 cursor-pointer"
            />
            <span className="text-sm text-foreground group-hover:text-foreground">
              Tidak ada riwayat penyakit di atas
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          Daftar Obat-obatan Pribadi yang Wajib Dikonsumsi
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Tuliskan jenis obat bawaan jika ada. Tulis &quot;Tidak ada&quot; jika tidak membawa obat khusus.
        </p>
        <textarea
          placeholder="Contoh: Amlodipine 5mg, Metformin 500mg"
          value={customer.medications || ""}
          onChange={handleChange("medications")}
          rows={2}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-3">
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
                className="w-4 h-4 text-primary-foreground border-border focus:ring-primary/20 cursor-pointer"
              />
              <span className="text-sm text-foreground group-hover:text-foreground">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onAutofill}
        className="text-xs text-primary-foreground font-semibold hover:underline"
      >
        Isi data contoh (Autofill)
      </button>
    </div>
  );
}

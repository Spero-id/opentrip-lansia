"use client";

import { Info } from "lucide-react";
import type { FormErrors, PrivateTripForm, SetFormField } from "@/features/private-trip/types";

const STANDAR_OPTIONS = [
  { value: "", label: "Pilih standar penginapan..." },
  { value: "budget", label: "Budget / Homestay" },
  { value: "bintang3", label: "Hotel Bintang 3" },
  { value: "bintang4", label: "Hotel Bintang 4" },
  { value: "bintang5", label: "Hotel Bintang 5" },
  { value: "villa", label: "Villa / Resort" },
];

const MAX_BUDGET = 100_000_000;

const LAYANAN_OPTIONS = [
  { key: "fotografer", label: "Fotografer / Video" },
  { key: "drone", label: "Kamera Drone" },
  { key: "gala", label: "Gala Dinner / BBQ" },
  { key: "tourLeader", label: "Tour Leader Khusus" },
];

export default function FacilitiesSection({
  form,
  set,
  errors,
}: {
  form: PrivateTripForm;
  set: SetFormField;
  errors: FormErrors;
}) {
  const baseInput =
    "w-full px-3 py-2.5 rounded-lg border text-[13px] leading-5 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors";
  const normalBorder = "border-border focus:border-primary";
  const errorBorder = "border-destructive-300 focus:border-destructive-400 focus:ring-destructive-100";

  const budgetDisplay = (raw: string) => {
    if (raw === "" || raw == null) return "";
    const num = Number(String(raw).replace(/\D/g, ""));
    if (isNaN(num) || num === 0) return "";
    return num.toLocaleString("id-ID");
  };

  const toggleLayanan = (key: string) => {
    const current = form.layananTambahan || [];
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    set("layananTambahan", next);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
          <Info size={16} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />
          Fasilitas, Preferensi &amp; Budget
        </h3>
      </div>
      <div className="h-px bg-border" />

      <div className="px-5 sm:px-6 py-5 space-y-5">
        <div id="field-standarPenginapan">
          <label htmlFor="field-standarPenginapan-select" className="text-[13px] font-medium text-foreground">
            Standar Penginapan <span className="text-destructive-600">*</span>
          </label>
          <div className="relative mt-1.5">
            <select
              id="field-standarPenginapan-select"
              value={form.standarPenginapan || ""}
              onChange={(e) => set("standarPenginapan", e.target.value)}
              className={`${baseInput} pr-8 appearance-none cursor-pointer ${errors.standarPenginapan ? errorBorder : normalBorder} ${!form.standarPenginapan ? "text-muted-foreground" : "text-foreground"}`}
            >
              {STANDAR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
          {errors.standarPenginapan && (
            <p className="text-xs text-destructive-500 mt-1.5">{errors.standarPenginapan}</p>
          )}
        </div>

        <div>
          <p className="text-[13px] font-medium text-foreground">Layanan Tambahan (Opsional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
            {LAYANAN_OPTIONS.map((opt) => {
              const checked = (form.layananTambahan || []).includes(opt.key);
              return (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-[13px] cursor-pointer transition-colors ${
                    checked
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted"
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
                      checked ? "bg-primary border-primary" : "bg-card border-border"
                    }`}
                    aria-hidden="true"
                  >
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </span>
                  <span className="text-foreground leading-none">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[13px] font-medium text-foreground">Catatan Kebutuhan Khusus</label>
          <textarea
            rows={3}
            placeholder="Ceritakan detail tambahan. Contoh: Ada peserta lansia/berkursi roda, request menu makanan khusus (halal/vegetarian), dsb."
            value={form.catatan || ""}
            onChange={(e) => set("catatan", e.target.value)}
            className={`${baseInput} mt-1.5 resize-none min-h-[84px] ${errors.catatan ? errorBorder : normalBorder}`}
          />
          {errors.catatan && (
            <p className="text-xs text-destructive-500 mt-1.5">{errors.catatan}</p>
          )}
        </div>

        <div>
          <label className="text-[13px] font-medium text-foreground">Estimasi Budget (Per Orang)</label>
          <div className="relative mt-1.5 w-full sm:max-w-[300px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-muted-foreground">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={12}
              placeholder="Kosongkan jika belum tahu"
              value={budgetDisplay(form.budget)}
              onChange={(e) => {
                let raw = e.target.value.replace(/\D/g, "").slice(0, 9);
                if (raw !== "" && Number(raw) > MAX_BUDGET) raw = String(MAX_BUDGET);
                set("budget", raw);
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
                  const digits = text.replace(/\D/g, "").slice(0, 9);
                  const capped = digits && Number(digits) > MAX_BUDGET ? String(MAX_BUDGET) : digits;
                  if (capped) set("budget", capped);
                }
              }}
              className={`${baseInput} pl-8 ${errors.budget ? errorBorder : normalBorder}`}
            />
          </div>
          {errors.budget && (
            <p className="text-xs text-destructive-500 mt-1.5">{errors.budget}</p>
          )}
        </div>

        <div id="field-metodeKontak">
          <p className="text-[13px] font-medium text-foreground">
            Pilih Metode Tindak Lanjut <span className="text-destructive-600">*</span>
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
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : "border-border text-foreground hover:border-border"
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
                      active ? "border-primary bg-card" : "border-border bg-card"
                    }`}
                    aria-hidden="true"
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <span className="text-[13px] leading-tight break-words">
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.metodeKontak && (
            <p className="text-xs text-destructive-500 mt-1.5">{errors.metodeKontak}</p>
          )}
        </div>
      </div>
    </div>
  );
}

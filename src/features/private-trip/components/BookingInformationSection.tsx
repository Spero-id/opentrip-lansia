"use client";

import { User } from "lucide-react";
import type { FormErrors, PrivateTripForm, SetFormField } from "@/features/private-trip/types";

const TIPE_OPTIONS = [
  { value: "Individu", label: "Individu / Keluarga" },
  { value: "Perusahaan", label: "Perusahaan (Corporate)" },
  { value: "Sekolah/Universitas", label: "Sekolah / Kampus" },
];

export default function BookingInformationSection({
  form,
  set,
  errors,
}: {
  form: PrivateTripForm;
  set: SetFormField;
  errors: FormErrors;
}) {
  const isInstitusi = form.tripFrom !== "Individu";
  const institusiLabel =
    form.tripFrom === "Perusahaan" ? "Nama Perusahaan" : "Nama Sekolah / Kampus";
  const institusiPlaceholder =
    form.tripFrom === "Perusahaan" ? "Cth: PT Maju Bersama" : "Cth: Universitas Indonesia";

  const baseInput =
    "w-full px-3 py-2.5 rounded-lg border text-[13px] leading-5 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors";
  const normalBorder = "border-border focus:border-primary";
  const errorBorder = "border-destructive-300 focus:border-destructive-400 focus:ring-destructive-100";

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
          <User size={16} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />
          Informasi Pemesan
        </h3>
      </div>
      <div className="h-px bg-border" />

      <div className="px-5 sm:px-6 py-5 space-y-5">
        <div>
          <p className="text-[13px] font-medium text-foreground">
            Tipe Pemesan <span className="text-destructive-600">*</span>
          </p>
          <fieldset className="mt-1.5 flex flex-col sm:flex-row gap-3">
            {TIPE_OPTIONS.map((opt) => {
              const active = form.tripFrom === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer group ${
                    active
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : "border-border text-foreground hover:border-border"
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
          </fieldset>
          {errors.tripFrom && (
            <p className="text-xs text-destructive-500 mt-1.5">{errors.tripFrom}</p>
          )}

          {isInstitusi && (
            <div className="mt-4">
              <label htmlFor="field-namaInstitusi" className="text-[13px] font-medium text-foreground">
                {institusiLabel} <span className="text-destructive-600">*</span>
              </label>
              <input
                id="field-namaInstitusi"
                type="text"
                placeholder={institusiPlaceholder}
                value={form.namaInstitusi}
                onChange={(e) => set("namaInstitusi", e.target.value)}
                className={`${baseInput} mt-1.5 ${errors.namaInstitusi ? errorBorder : normalBorder}`}
              />
              {errors.namaInstitusi && (
                <p className="text-xs text-destructive-500 mt-1.5">{errors.namaInstitusi}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="field-nama" className="text-[13px] font-medium text-foreground">
              Nama Lengkap <span className="text-destructive-600">*</span>
            </label>
            <input
              id="field-nama"
              type="text"
              placeholder="Cth: Budi Santoso"
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              className={`${baseInput} mt-1.5 ${errors.nama ? errorBorder : normalBorder}`}
            />
            {errors.nama && (
              <p className="text-xs text-destructive-500 mt-1.5">{errors.nama}</p>
            )}
          </div>

          <div>
            <label htmlFor="field-phone" className="text-[13px] font-medium text-foreground">
              No. WhatsApp <span className="text-destructive-600">*</span>
            </label>
            <input
              id="field-phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={15}
              placeholder="Cth: 081234567890"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 15))}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) return;
                if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                if (e.key.length === 1 && !/^\d$/.test(e.key)) e.preventDefault();
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (/\D/.test(text)) {
                  e.preventDefault();
                  const digits = text.replace(/\D/g, "").slice(0, 15);
                  if (digits) set("phone", `${form.phone}${digits}`.replace(/\D/g, "").slice(0, 15));
                }
              }}
              className={`${baseInput} mt-1.5 ${errors.phone ? errorBorder : normalBorder}`}
            />
            {errors.phone && (
              <p className="text-xs text-destructive-500 mt-1.5">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="field-email" className="text-[13px] font-medium text-foreground">
            Email <span className="text-destructive-600">*</span>
          </label>
          <input
            id="field-email"
            type="email"
            placeholder="Cth: budi@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={`${baseInput} mt-1.5 ${errors.email ? errorBorder : normalBorder}`}
          />
          {errors.email ? (
            <p className="text-xs text-destructive-500 mt-1.5">{errors.email}</p>
          ) : (
            <p className="text-[11px] leading-4 text-muted-foreground mt-1.5">
              Proposal &amp; detail penawaran akan dikirimkan ke email ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

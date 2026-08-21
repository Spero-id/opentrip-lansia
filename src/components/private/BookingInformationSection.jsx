"use client";

import Field from "./Field";
import SectionCard from "./SectionCard";
import { inputCls } from "./helpers/helpers";

export default function BookingInformationSection({
  form,
  set,
  errors,
}) {
  return (
    <SectionCard
      icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      title="Informasi Pemesan"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Nama Pemesan" required error={errors.nama}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input type="text" placeholder="Ex. John Doe" value={form.nama}
              onChange={e => set("nama", e.target.value)}
              className={inputCls(errors.nama, "pl-9")} />
          </div>
        </Field>

        <Field label="Nomor Ponsel" required error={errors.phone}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.578 1.238l-.466.397a1 1 0 0 0-.302 1.212 12.06 12.06 0 0 0 6.178 6.121"/></svg>
            </span>
            <input type="tel" placeholder="Ex. 081xxxxxxxxx" value={form.phone}
              onChange={e => set("phone", e.target.value)}
              className={inputCls(errors.phone, "pl-9")} />
          </div>
        </Field>

        <Field label="Email" required error={errors.email} hint="Konfirmasi akan dikirim ke email ini">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </span>
            <input type="email" placeholder="Ex. xxxx@xxxxx.xxx" value={form.email} onChange={e => set("email", e.target.value)} className={inputCls(errors.email, "pl-9")} />
          </div>
        </Field>

        <Field
          label="Jumlah Peserta"
          required
          error={errors.jumlahPeserta}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <input
              type="number"
              value={form.jumlahPeserta}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  set("jumlahPeserta", val);
                }
              }}
              onKeyDown={e => {
                if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
                  e.preventDefault();
                }
              }}
              placeholder="Jumlah peserta"
              className={inputCls(errors.jumlahPeserta, "pl-9")}
            />
          </div>
        </Field>
      </div>
    </SectionCard>
  );
}

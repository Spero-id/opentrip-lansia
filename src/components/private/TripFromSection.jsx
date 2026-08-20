import Field from "./Field";
import Radio from "./Radio";
import SectionCard from "./SectionCard";
import { inputCls } from "./helpers/helpers";
import { A, TRIP_FROM } from "./helpers/constants";

export default function TripFromSection({
  form,
  set,
  errors,
}) {
  return (
    <SectionCard
      icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
      title="Asal Pemesanan"
    >
      <div className="space-y-2.5">
        {TRIP_FROM.map((opt) => {
          const active = form.tripFrom === opt;
          const isInstitusi = opt !== "Individu";
          return (
            <div key={opt}>
              <div
                className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all"
                style={active
                  ? { borderColor: A, backgroundColor: `${A}08` }
                  : { borderColor: "#e5e7eb", backgroundColor: "#f9fafb" }}
                onClick={() => set("tripFrom", opt)}
              >
                <span className="text-xs font-semibold text-gray-700">{opt}</span>
                <Radio active={active} onClick={() => set("tripFrom", opt)} />
              </div>

              {active && isInstitusi && (
                <div className="mt-2.5 pl-1">
                  <Field
                    label={opt === "Perusahaan" ? "Nama Perusahaan" : "Nama Sekolah / Universitas"}
                    required
                    error={errors.namaInstitusi}
                  >
                    <input
                      type="text"
                      placeholder={opt === "Perusahaan" ? "Contoh: PT Maju Bersama" : "Contoh: Universitas Indonesia"}
                      value={form.namaInstitusi}
                      onChange={e => set("namaInstitusi", e.target.value)}
                      className={inputCls(errors.namaInstitusi)}
                    />
                  </Field>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

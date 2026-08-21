import Field from "./Field";
import SectionCard from "./SectionCard";
import { inputCls } from "./helpers/helpers";
import { A } from "./helpers/constants";

function budgetDisplay(raw) {
  if (raw === "" || raw === undefined || raw === null) return "";
  const num = Number(String(raw).replace(/\D/g, ""));
  if (isNaN(num) || num === 0) return "";
  return num.toLocaleString("id-ID");
}

export default function TripDetailSection({
  form,
  set,
  errors,
  budgetValue,
}) {
  return (
    <SectionCard
      icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
      title="Detail Perjalanan"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <Field label="Tanggal Keberangkatan" required error={errors.tanggal}>
              <input type="date" value={form.tanggal}
                onChange={e => set("tanggal", e.target.value)}
                className={inputCls(errors.tanggal, "w-full")} />
            </Field>
          </div>
          <div className="w-28 shrink-0">
            <Field label="Durasi">
              <div className="relative">
                <input type="number" min="1" value={form.durasi}
                  onChange={e => set("durasi", e.target.value)}
                  className={inputCls(null, "pr-10 w-full")} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Hari</span>
              </div>
            </Field>
          </div>
        </div>

        <Field label="Meeting Point" required error={errors.meetingPoint}>
          <input type="text"
            placeholder="Ex. Depan Stasiun Juanda, Jakarta Pusat"
            value={form.meetingPoint}
            onChange={e => set("meetingPoint", e.target.value)}
            className={inputCls(errors.meetingPoint)} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Catatan / Keinginan Trip" required error={errors.catatan}>
            <textarea rows={3}
              placeholder="Deskripsikan trip yang kamu inginkan, agar tim kami dapat membantu mewujudkannya"
              value={form.catatan}
              onChange={e => set("catatan", e.target.value)}
              className={inputCls(errors.catatan, "resize-none")} />
          </Field>
        </div>

        <Field
          label="Budget per pax"
          hint={form.tripType === "explorer" && form.selectedDestinasi
            ? "Harga mengikuti destinasi yang dipilih"
            : "Kosongkan jika belum tahu"}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex. 100.000"
              value={
                form.tripType === "explorer" && form.selectedDestinasi
                  ? Number(form.selectedDestinasi.priceMin).toLocaleString("id-ID")
                  : budgetDisplay(budgetValue)
              }
              onChange={e => {
                if (form.tripType !== "custom") return;
                const raw = e.target.value.replace(/\D/g, "");
                set("budget", raw);
              }}
              readOnly={form.tripType === "explorer"}
              className={inputCls(null, "pl-9 pr-12") + (form.tripType === "explorer" ? " bg-gray-100 text-gray-500 cursor-not-allowed" : "")}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">/pax</span>
          </div>
          {form.tripType === "explorer" && form.selectedDestinasi && (
            <p className="text-[10px] text-gray-400 mt-1">
              Harga dari destinasi dipilih.{" "}
              <button type="button" className="font-semibold underline" style={{ color: A }}
                onClick={() => set("tripType", "custom")}>
                Gunakan Custom Trip
              </button>{" "}untuk mengubah.
            </p>
          )}
        </Field>
      </div>
    </SectionCard>
  );
}

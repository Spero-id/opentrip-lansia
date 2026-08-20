import Radio from "./Radio";
import SectionCard from "./SectionCard";
import { inputCls } from "./helpers/helpers";
import { A, TRIP_OPTIONS } from "./helpers/constants";
import DestinationCard from "./DestinationCard";
import SelectedDestination from "./SelectedDestination";

export default function TripOptionSection({
  form,
  set,
  errors,
  destinationsData,
}) {
  return (
    <SectionCard
      icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
      title="Pilih Trip"
    >
      <div className="space-y-4">
        {TRIP_OPTIONS.map((opt) => {
          const active = form.tripType === opt.id;
          return (
            <div key={opt.id}>
              <div
                className="flex items-start justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all"
                style={active
                  ? { borderColor: A, backgroundColor: `${A}08` }
                  : { borderColor: "#e5e7eb", backgroundColor: "#f9fafb" }}
                onClick={() => set("tripType", opt.id)}
              >
                <div>
                  <p className="text-xs font-semibold text-gray-700">{opt.label}</p>
                  <p className="text-xs text-gray-400 font-normal mt-0.5">{opt.desc}</p>
                </div>
                <Radio active={active} onClick={() => set("tripType", opt.id)} />
              </div>

              {opt.id === "custom" && active && (
                <div className="mt-2.5 pl-1">
                  <input type="text" placeholder="Contoh: Rafting Sungai Elo"
                    value={form.customTripName}
                    onChange={e => set("customTripName", e.target.value)}
                    className={inputCls(errors.customTripName, "")} />
                  {errors.customTripName && <p className="text-xs text-red-400 mt-1">{errors.customTripName}</p>}
                </div>
              )}

              {opt.id === "explorer" && active && (
                <div className="mt-3 pl-1">
                  {form.selectedDestinasi ? (
                    <SelectedDestination
                      destination={form.selectedDestinasi}
                      onClear={() => set("selectedDestinasi", null)}
                    />
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2.5">Pilih salah satu destinasi:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 rounded-xl">
                        {destinationsData.map((dest) => (
                          <DestinationCard
                            key={dest.id}
                            dest={dest}
                            onSelect={() => set("selectedDestinasi", dest)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.selectedDestinasi && (
                    <p className="text-xs text-red-400 mt-1">{errors.selectedDestinasi}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

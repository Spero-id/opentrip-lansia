import { Route } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function ItinerarySection({ dest, shortLocation }) {
  return (
    <section>
      <SectionHeading icon={Route}>Rencana Perjalanan</SectionHeading>

      <div className="relative">
        <div
          className="absolute bottom-3 left-4 top-3 w-px bg-slate-200"
          aria-hidden
        />
        <ol className="space-y-5">
          {dest.itinerary?.map((item, index) => (
            <li key={index} className="relative pl-12">
              <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF6E7] text-xs font-bold text-[#c47d12] ring-4 ring-white">
                {item.day}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#F49D1A]/40 hover:shadow-md sm:p-5">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#F49D1A]">
                    Hari {item.day}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500">
                    {shortLocation}
                  </span>
                </div>
                <h4 className="text-base font-bold text-gray-900 sm:text-lg">
                  {item.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
import { Clock, MapPin } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function MeetingSection({ dest }) {
  const meetingPoints = dest.meetingPoints?.length ? dest.meetingPoints : [];

  if (meetingPoints.length === 0) {
    return (
      <section>
        <SectionHeading icon={MapPin}>Titik Kumpul</SectionHeading>
        <p className="text-sm text-gray-400">
          Informasi titik kumpul akan dikirim setelah pemesanan kamu dikonfirmasi.
        </p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading icon={MapPin}>Titik Kumpul</SectionHeading>

      <div className="relative">
        <div
          className="absolute bottom-3 left-4 top-3 w-px bg-slate-200"
          aria-hidden
        />
        <ol className="space-y-5">
          {meetingPoints.map((point, index) => (
            <li key={index} className="relative pl-12">
              <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF6E7] text-[#c47d12] ring-4 ring-white">
                <Clock size={15} />
              </span>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#F49D1A]/40 hover:shadow-md sm:p-5">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#F49D1A]">
                    Kumpul Pukul
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500">
                    {point.time}
                  </span>
                </div>
                <h4 className="flex items-center gap-1.5 text-base font-bold text-gray-900">
                  <MapPin size={15} className="shrink-0 text-[#F49D1A]" />
                  {point.location}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {point.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
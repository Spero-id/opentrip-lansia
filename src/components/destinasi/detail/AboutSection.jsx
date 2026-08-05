import { Check } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function AboutSection({ dest }) {
  return (
    <div>
      <section className="mb-10">
        <SectionHeading className="mb-3 sm:mb-4">
          Tentang Destinasi
        </SectionHeading>
        <p className="text-base leading-relaxed text-gray-600 sm:text-md sm:leading-loose">
          {dest.description}
        </p>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">
          Fasilitas
        </h3>
        <ul className="flex flex-wrap gap-2.5">
          {(dest.facilities?.length ? dest.facilities : dest.highlights ?? []).map((item, index) => (
            <li
              key={index}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700"
            >
              <Check size={14} strokeWidth={3} className="text-[#F49D1A]" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

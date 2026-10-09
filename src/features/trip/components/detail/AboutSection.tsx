import { DynamicLucideIcon } from "@/app/(admin)/admin/components/icon-picker";
import SectionHeading from "./SectionHeading";

import type { TripDetail } from "@/features/trip/types";

interface AboutSectionProps {
  dest: TripDetail;
}

export default function AboutSection({ dest }: AboutSectionProps) {
  return (
    <div>
      <section className="mb-10">
        <SectionHeading className="mb-3 sm:mb-4">
          Tentang Destinasi
        </SectionHeading>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-md sm:leading-loose">
          {dest.description}
        </p>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-foreground sm:text-xl">
          Fasilitas
        </h3>
        <ul className="flex flex-wrap gap-2.5">
          {(dest.facilities?.length ? dest.facilities : dest.highlights ?? []).map((item, index) => {
            const isObject = typeof item === "object" && item !== null;
            const label = isObject ? item.name : item;
            const iconName = isObject ? item.icon : "Check";

            return (
              <li
                key={index}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground"
              >
                <span className="text-primary-foreground">
                  <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                </span>
                {label}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

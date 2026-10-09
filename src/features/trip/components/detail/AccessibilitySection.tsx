import SectionHeading from "./SectionHeading";

import type { TripDetail } from "@/features/trip/types";

export default function AccessibilitySection({ dest }: { dest: TripDetail }) {
  return (
    <div>
      <section className="mb-10">
        <SectionHeading className="mb-3 sm:mb-4">
          Aksesibilitas
        </SectionHeading>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-md sm:leading-loose">
          {dest.accessibilityInfo || "Belum ada informasi aksesibilitas."}
        </p>
      </section>
    </div>
  );
}

import SectionHeading from "./SectionHeading";

export default function AccessibilitySection({ dest }) {
  return (
    <div>
      <section className="mb-10">
        <SectionHeading className="mb-3 sm:mb-4">
          Aksesibilitas
        </SectionHeading>
        <p className="text-base leading-relaxed text-gray-600 sm:text-md sm:leading-loose">
          {dest.accessibilityInfo || "Belum ada informasi aksesibilitas."}
        </p>
      </section>
    </div>
  );
}

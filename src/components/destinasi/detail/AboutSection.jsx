import { DynamicLucideIcon } from "@/app/admin/components/icon-picker";
import { sanitizeBlogContent } from "@/shared/utils/sanitize";
import SectionHeading from "./SectionHeading";

export default function AboutSection({ dest }) {
  return (
    <div>
      <section className="mb-10">
        <SectionHeading className="mb-3 sm:mb-4">
          Tentang Destinasi
        </SectionHeading>
        <div
          className="text-base leading-7 text-gray-600 prose prose-slate max-w-none [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(dest.description) || "Belum ada deskripsi." }}
        />
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">
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
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700"
              >
                <span className="text-[#F49D1A]">
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

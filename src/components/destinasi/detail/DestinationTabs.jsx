import { FileText, Route, Accessibility } from "lucide-react";

const TABS = [
  { id: "tentang", label: "Deskripsi", icon: FileText },
  { id: "itinerary", label: "Itinerary", icon: Route },
  { id: "aksesibilitas", label: "Aksesibilitas", icon: Accessibility },
];

export default function DestinationTabs({ activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Navigasi detail destinasi"
      className="mb-6 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-white text-[#F49D1A] shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Icon
              size={15}
              className={isActive ? "text-[#F49D1A]" : "text-gray-400"}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export { TABS };
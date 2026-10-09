import { FileText, Route, Accessibility, Star } from "lucide-react";

import type { TripTabId } from "@/features/trip/types";

const TABS: Array<{ id: TripTabId; label: string; icon: typeof FileText }> = [
  { id: "tentang", label: "Deskripsi", icon: FileText },
  { id: "itinerary", label: "Rundown", icon: Route },
  { id: "aksesibilitas", label: "Aksesibilitas", icon: Accessibility },
  { id: "ulasan", label: "Ulasan", icon: Star },
];

export default function DestinationTabs({ activeTab, onChange }: { activeTab: TripTabId; onChange: (id: TripTabId) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Navigasi detail destinasi"
      className="mb-6 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                ? "bg-card text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon
              size={15}
              className={isActive ? "text-primary-foreground" : "text-muted-foreground"}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export { TABS };
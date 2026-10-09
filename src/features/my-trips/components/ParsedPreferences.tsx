"use client";

import { parsePreferences } from "@/features/my-trips";

export default function ParsedPreferences({ text }: { text?: string | null }) {
  if (!text) return <span className="text-muted-foreground text-xs">-</span>;

  const sections = parsePreferences(text);

  if (sections.length === 0) {
    return <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>;
  }

  return (
    <div className="space-y-3">
      {sections.map((sec, si) => (
        <div key={si}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {sec.title}
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            {sec.rows.map((row, ri) => (
              <div
                key={ri}
                className={`flex text-xs ${ri % 2 === 0 ? "bg-muted" : "bg-card"}`}
              >
                <span className="w-40 shrink-0 px-3 py-2 text-muted-foreground font-medium border-r border-border">
                  {row.key}
                </span>
                <span className="px-3 py-2 text-foreground font-semibold flex-1 min-w-0 break-words">
                  {row.value || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

export default function ParsedPreferences({ text }) {
  if (!text) return <span className="text-gray-400 text-xs">-</span>;

  const sections = [];
  let current = null;

  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      if (current) sections.push(current);
      current = { title: sectionMatch[1], rows: [] };
    } else if (current) {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0) {
        current.rows.push({
          key: trimmed.slice(0, colonIdx).trim(),
          value: trimmed.slice(colonIdx + 1).trim(),
        });
      }
    }
  });
  if (current) sections.push(current);

  if (sections.length === 0) {
    return <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{text}</p>;
  }

  return (
    <div className="space-y-3">
      {sections.map((sec, si) => (
        <div key={si}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {sec.title}
          </p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {sec.rows.map((row, ri) => (
              <div
                key={ri}
                className={`flex text-xs ${ri % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <span className="w-40 shrink-0 px-3 py-2 text-gray-500 font-medium border-r border-gray-100">
                  {row.key}
                </span>
                <span className="px-3 py-2 text-gray-800 font-semibold flex-1 min-w-0 break-words">
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

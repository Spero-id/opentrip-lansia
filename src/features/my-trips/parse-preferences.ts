export interface PreferenceSection {
  title: string;
  rows: { key: string; value: string }[];
}

export function parsePreferences(text: string): PreferenceSection[] {
  const sections: PreferenceSection[] = [];
  let current: PreferenceSection | null = null;

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
  return sections;
}

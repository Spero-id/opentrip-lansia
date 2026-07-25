"use client";
export default function CopyButton({ text }: { text: string }) {
  return (
    <button onClick={() => navigator.clipboard.writeText(text)} className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark">
      Salin
    </button>
  );
}

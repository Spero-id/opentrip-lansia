const A = "var(--primary)";

export default function Radio({ active, onClick }: { active?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors"
      style={active ? { borderColor: A } : { borderColor: "var(--border)" }}
    >
      {active && (
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: A }}
        />
      )}
    </div>
  );
}

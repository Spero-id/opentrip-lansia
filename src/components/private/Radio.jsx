const A = "#df7224";

export default function Radio({ active, onClick }) {
  return (
    <div
      onClick={onClick}
      className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
      style={active ? { borderColor: A } : { borderColor: "#d1d5db" }}
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

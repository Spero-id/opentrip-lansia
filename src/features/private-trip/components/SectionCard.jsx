const A = "#F49D1A";

export default function SectionCard({
  icon,
  title,
  children,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-5">
        <span
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${A}15` }}
        >
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

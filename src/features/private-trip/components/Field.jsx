"use client";

const A = "#F49D1A";

export default function Field({
  label,
  icon: Icon,
  required = false,
  optional = false,
  error,
  hint,
  children,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
        {Icon && <Icon size={14} className="text-gray-400" />}
        <span>
          {label}
          {required && (
            <span className="ml-0.5" style={{ color: A }}>*</span>
          )}
          {optional && (
            <span className="ml-1 text-gray-400 font-normal">(opsional)</span>
          )}
        </span>
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

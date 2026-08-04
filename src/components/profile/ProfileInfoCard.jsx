"use client";

import { User, Mail, Phone, ShieldCheck } from "lucide-react";

export default function ProfileInfoCard({ user }) {
  const rows = [
    { label: "Nama Lengkap", value: user?.name || "-", icon: User },
    { label: "Email", value: user?.email || "-", icon: Mail },
    { label: "No. HP", value: user?.phone || "-", icon: Phone },
    {
      label: "Role",
      value: user?.role === "admin" ? "Admin" : "Member",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-base font-bold text-slate-900">Informasi Akun</h2>
      <p className="mt-0.5 mb-4 text-xs text-slate-400">
        Data pribadi yang terhubung dengan akun kamu.
      </p>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <row.icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400">{row.label}</p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

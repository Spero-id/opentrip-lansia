"use client";

import { Coins, Ticket, CalendarDays, Clock } from "lucide-react";

export default function ProfileStats({ user }) {
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : "-";

  const stats = [
    { label: "Poin Loyalitas", icon: Coins, comingSoon: true },
    { label: "Kode Referral", icon: Ticket, comingSoon: true },
    { label: "Anggota Sejak", value: memberSince, icon: CalendarDays },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF6E7] text-[#c47d12]">
              <stat.icon size={17} />
            </div>
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
          </div>

          {stat.comingSoon ? (
            <div className="mt-3 flex w-fit items-center gap-1.5 rounded-lg border border-[#F3E2C0] bg-[#FEF6E7] px-2.5 py-1.5">
              <Clock size={12} className="text-[#c47d12]" />
              <span className="text-[11px] font-semibold text-[#c47d12]">
                Segera Hadir
              </span>
            </div>
          ) : (
            <p className="mt-3 truncate text-lg font-bold text-slate-900">
              {stat.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

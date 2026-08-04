"use client";

import { useState } from "react";
import { Coins, Ticket, CalendarDays, Copy, Check } from "lucide-react";

export default function ProfileStats({ user }) {
  const [copied, setCopied] = useState(false);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : "-";

  const referralCode = user?.referralCode || "-";

  function copyReferral() {
    if (!user?.referralCode) return;
    navigator.clipboard?.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const stats = [
    { label: "Poin Loyalitas", value: user?.loyaltyPoints ?? 0, icon: Coins },
    { label: "Kode Referral", value: referralCode, icon: Ticket },
    { label: "Anggota Sejak", value: memberSince, icon: CalendarDays },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat) => {
        const isReferral = stat.label === "Kode Referral";
        return (
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
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="truncate text-lg font-bold text-slate-900">
                {stat.value}
              </p>
              {isReferral && user?.referralCode && (
                <button
                  type="button"
                  onClick={copyReferral}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-[#F49D1A] hover:text-[#c47d12]"
                  aria-label="Salin kode referral"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { Coins, CalendarDays, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfileStats({ user }) {
  const [referralData, setReferralData] = useState(null);
  useEffect(() => {
    fetch("/api/user/referral")
      .then((res) => res.json())
      .then((data) => setReferralData(data))
      .catch(() => {});
  }, []);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : "-";

  const formatPoints = (points) => {
    if (!points || points === 0) return "0";
    return points.toLocaleString("id-ID");
  };

  const stats = [
    {
      label: "Poin Loyalitas",
      icon: Coins,
      value: formatPoints(referralData?.loyaltyPoints ?? 0),
    },
    {
      label: "Total Referral",
      icon: Users,
      value: referralData?.stats?.totalReferred ?? 0,
    },
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

          <p className="mt-3 truncate text-lg font-bold text-slate-900">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

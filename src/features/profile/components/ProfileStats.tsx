"use client";

import { Coins, CalendarDays, Users } from "lucide-react";
import { useProfileStats, type ProfileUser } from "@/features/profile";

export default function ProfileStats({ user }: { user?: ProfileUser | null }) {
  const { data: referralData } = useProfileStats();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : "-";

  const formatPoints = (points: number) => {
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
          className="rounded-2xl border border-border bg-card p-4 sm:p-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-foreground/90">
              <stat.icon size={17} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          </div>

          <p className="mt-3 truncate text-lg font-bold text-foreground">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

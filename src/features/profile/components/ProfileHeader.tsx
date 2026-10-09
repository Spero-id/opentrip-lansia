"use client";

import type { ProfileUser } from "@/features/profile";

export default function ProfileHeader({ user }: { user?: ProfileUser | null }) {
  const initial = (user?.name || "U").charAt(0).toUpperCase();
  const isAdmin = user?.role === "admin";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-24 bg-primary/10 sm:h-28">
        <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-primary/10" />
        <div className="absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-primary/10" />
        <p className="absolute bottom-4 right-6 hidden text-xs font-semibold text-primary-foreground/90 sm:block">
          Selamat datang di profil kamu
        </p>
      </div>

      <div className="absolute left-5 top-14 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary text-2xl font-bold text-primary-foreground shadow-sm sm:left-7 sm:top-16">
        {initial}
      </div>
      {user?.image && (
        <img
          key={user.image}
          src={user.image}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute left-5 top-14 h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm sm:left-7 sm:top-16"
        />
      )}

      <div className="px-5 pb-6 pt-4 sm:px-7">
        <div className="flex items-end justify-between gap-3 pl-20 sm:pl-24">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
              {user?.name}
            </h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              isAdmin
                ? "bg-primary/10 text-primary-foreground/90"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isAdmin ? "Admin" : "Member"}
          </span>
        </div>
      </div>
    </div>
  );
}

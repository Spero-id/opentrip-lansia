"use client";

export default function ProfileHeader({ user }) {
  const initial = (user?.name || "U").charAt(0).toUpperCase();
  const isAdmin = user?.role === "admin";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-24 bg-[#FEF6E7] sm:h-28">
        <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-[#F49D1A]/10" />
        <div className="absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-[#F49D1A]/10" />
        <p className="absolute bottom-4 right-6 hidden text-xs font-semibold text-[#c47d12] sm:block">
          Selamat datang di profil kamu
        </p>
      </div>

      {user?.image ? (
        <img
          src={user.image}
          alt={user?.name}
          className="absolute left-5 top-14 h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm sm:left-7 sm:top-16"
        />
      ) : (
        <div className="absolute left-5 top-14 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#F49D1A] text-2xl font-bold text-white shadow-sm sm:left-7 sm:top-16">
          {initial}
        </div>
      )}

      <div className="px-5 pb-6 pt-4 sm:px-7">
        <div className="flex items-end justify-between gap-3 pl-20 sm:pl-24">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {user?.name}
            </h1>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {user?.email}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              isAdmin
                ? "bg-[#FEF6E7] text-[#c47d12]"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isAdmin ? "Admin" : "Member"}
          </span>
        </div>
      </div>
    </div>
  );
}

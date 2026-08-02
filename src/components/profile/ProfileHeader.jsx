"use client";

export default function ProfileHeader({ user }) {
  const initial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F49D1A] text-2xl font-bold text-white shadow-md shadow-[#F49D1A]/30">
        {initial}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>
    </div>
  );
}

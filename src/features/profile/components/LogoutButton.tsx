"use client";

import { LogOut } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/use-logout";

export default function LogoutButton() {
  const { logout, loading } = useLogout();

  return (
    <button
      type="button"
      onClick={() => logout()}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3.5 text-sm font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-destructive disabled:opacity-50"
    >
      <LogOut size={16} />
      {loading ? "Keluar..." : "Keluar dari Akun"}
    </button>
  );
}

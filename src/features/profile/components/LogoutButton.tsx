"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    const { error } = await signOut();

    if (error) {
      setLoading(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-destructive-200 hover:bg-destructive-50 hover:text-destructive-600 disabled:opacity-50"
    >
      <LogOut size={16} />
      {loading ? "Keluar..." : "Keluar dari Akun"}
    </button>
  );
}

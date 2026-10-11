"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { useProfileStats } from "@/features/profile";
import {
  LogoutButton,
  ProfileHeader,
  ProfileInfoCard,
  ProfileStats,
  ReferralCard,
  ReferralHistory,
} from "@/features/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: referralStats } = useProfileStats();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  if (isPending || !session?.user) {
    return (
      <>
        <main className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Kembali ke Beranda
          </Link>

          <div className="mt-4 space-y-4 sm:space-y-5">
            <ProfileHeader user={session.user} />
            <ProfileStats user={session.user} />
            <ProfileInfoCard user={session.user} />
            <ReferralCard
              referralCode={(session.user as { referralCode?: string | null }).referralCode}
              stats={referralStats?.stats}
            />
            <ReferralHistory />
            <LogoutButton />
          </div>
        </div>
      </main>
    </>
  );
}

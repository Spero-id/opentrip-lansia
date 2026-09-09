"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import ReferralCard from "@/components/profile/ReferralCard";
import ReferralHistory from "@/components/profile/ReferralHistory";
import LogoutButton from "@/components/profile/LogoutButton";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [referralStats, setReferralStats] = useState(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/referral")
        .then((res) => res.json())
        .then((data) => setReferralStats(data))
        .catch(() => {});
    }
  }, [session?.user]);

  if (isPending || !session?.user) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-sm text-slate-400">Memuat...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={14} />
            Kembali ke Beranda
          </Link>

          <div className="mt-4 space-y-4 sm:space-y-5">
            <ProfileHeader user={session.user} />
            <ProfileStats user={session.user} />
            <ProfileInfoCard user={session.user} />
            <ReferralCard 
              referralCode={session.user.referralCode} 
              stats={referralStats?.stats}
            />
            <ReferralHistory />
            <LogoutButton />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

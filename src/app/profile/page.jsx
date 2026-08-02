"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import LogoutButton from "@/components/profile/LogoutButton";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  if (isPending || !session?.user) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Memuat...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <ProfileHeader user={session.user} />
        <div className="mt-8 space-y-6">
          <ProfileInfoCard user={session.user} />
          <LogoutButton />
        </div>
      </main>
      <Footer />
    </>
  );
}

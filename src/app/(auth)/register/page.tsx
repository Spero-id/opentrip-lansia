"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { signUp, signIn } from "@/lib/auth/client";
import { readRedirectFromSearch } from "@/utils/redirect";
import AuthAside from "@/features/auth/components/AuthAside";
import AuthTextField from "@/features/auth/components/AuthTextField";
import PasswordField from "@/features/auth/components/PasswordField";
import SocialLoginButton from "@/features/auth/components/SocialLoginButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function getRedirectPath() {
    if (typeof window === "undefined") return "/admin";
    return readRedirectFromSearch(window.location.search, {
      allowAdmin: false,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message || "Gagal mendaftar, coba lagi.");
      setLoading(false);
      return;
    }

    router.push(getRedirectPath());
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL: getRedirectPath(),
    });
    setGoogleLoading(false);
  }

  return (
    <div className="fixed inset-0 overflow-hidden lg:static lg:h-auto lg:min-h-screen bg-background flex flex-col lg:flex lg:items-center lg:justify-center lg:p-4">
      <div className="flex flex-col flex-1 min-h-0 lg:min-h-0 lg:flex-none w-full max-w-6xl lg:grid lg:grid-cols-2 lg:rounded-2xl overflow-hidden lg:shadow-2xl">

        <AuthAside
          image="/register-page-image.jpeg"
          wrapperClassName="order-1 lg:order-1"
          title={
            <>
              Mulai Petualanganmu.{" "}
              <br className="hidden lg:block" /> Satu Langkah Lagi.
            </>
          }
          description="Daftar sekarang dan temukan destinasi impian dengan pengalaman tak terlupakan."
        />

        <div className="order-2 lg:order-2 relative -mt-8 lg:mt-0 flex-1 min-h-0 overflow-y-auto bg-background rounded-t-3xl lg:rounded-none p-6 sm:p-10 flex flex-col justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
          >
            <ArrowLeft size={14} />
            Kembali ke Website
          </Link>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground pt-30 sm:pt-0 mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Daftar untuk mulai merencanakan trip berikutnya.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <AuthTextField
              label="Nama Lengkap"
              value={name}
              onChange={setName}
              placeholder="Masukkan nama kamu"
            />

            <AuthTextField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Masukkan email kamu"
            />

            <PasswordField value={password} onChange={setPassword} />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-muted-foreground font-normal cursor-pointer">
                  Saya setuju dengan Syarat & Ketentuan
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              variant="default"
              className="w-full"
            >
              {loading ? "Memproses..." : "Daftar"}
            </Button>
          </form>

          <SocialLoginButton
            onClick={handleGoogleLogin}
            loading={googleLoading}
            label="Daftar dengan Google"
            dividerClassName="my-3 sm:my-4"
          />

          <p className="text-center text-sm text-muted-foreground mt-4 sm:mt-8">
            Sudah Punya Akun?{" "}
            <a href="/login" className="italic text-foreground font-semibold hover:text-primary">
              Masuk di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
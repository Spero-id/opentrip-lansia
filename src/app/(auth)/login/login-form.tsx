"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth/client";
import {
  DEFAULT_REDIRECT,
  buildAuthHref,
  readRedirectFromSearch,
} from "@/utils/redirect";
import { loginSchema, type LoginInput } from "@/features/auth/auth.schema";
import AuthAside from "@/features/auth/components/AuthAside";
import AuthTextField from "@/features/auth/components/AuthTextField";
import PasswordField from "@/features/auth/components/PasswordField";
import SocialLoginButton from "@/features/auth/components/SocialLoginButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function getServerSnapshot() {
  return DEFAULT_REDIRECT;
}

function getClientSnapshot() {
  return readRedirectFromSearch(window.location.search, { allowAdmin: true });
}

const emptySubscribe = () => () => {};

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectPath = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const registerHref = buildAuthHref("/register", redirectPath);

  async function onSubmit(values: LoginInput) {
    setError("");

    const { error: signInError } = await signIn.email(values);

    if (signInError) {
      setError(signInError.message || "Email atau password salah");
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL: redirectPath,
    });
    setGoogleLoading(false);
  }

  return (
    <div className="fixed inset-0 overflow-hidden lg:static lg:h-auto lg:min-h-screen bg-background flex flex-col lg:flex">
      <div className="flex flex-col flex-1 min-h-0 lg:min-h-screen lg:flex-none w-full lg:grid lg:grid-cols-2 lg:grid-rows-1 overflow-hidden">
        <AuthAside
          image="/login-image-page.jpeg"
          wrapperClassName="lg:rounded-none"
          gradientClassName="rounded-b-3xl lg:rounded-none"
          title={
            <>
              Jelajahi Lebih Jauh. <br className="hidden lg:block" /> Kenangan
              Lebih Lama.
            </>
          }
          description="Dari trip singkat akhir pekan sampai petualangan panjang, temukan semuanya lewat satu platform."
        />

        <div className="relative flex-1 min-h-0 overflow-y-auto bg-background p-10 flex flex-col justify-center lg:w-full lg:mx-auto lg:max-w-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
          >
            <ArrowLeft size={14} />
            Kembali ke Beranda
          </Link>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Selamat Datang Kembali
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            Masuk untuk mulai merencanakan trip berikutnya.
          </p>

          {/* Always render this slot so the card height stays stable when a server error appears */}
          <div className="mb-4 min-h-[46px]">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <AuthTextField
              label="Email"
              type="email"
              placeholder="Masukkan email kamu"
              error={errors.email?.message}
              {...register("email", { onChange: () => clearErrors("email") })}
            />

            <PasswordField
              placeholder="Masukkan password kamu"
              error={errors.password?.message}
              {...register("password", { onChange: () => clearErrors("password") })}
            />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="text-muted-foreground font-normal cursor-pointer">
                  Ingat saya
                </Label>
              </div>
              <a
                href="#"
                className="text-primary font-medium hover:underline"
              >
                Lupa Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              variant="default"
              className="w-full mt-5"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <SocialLoginButton
            onClick={handleGoogleLogin}
            loading={googleLoading}
            label="Masuk dengan Google"
          />

          <p className="text-center text-sm text-muted-foreground mt-8">
            Belum punya akun?{" "}
            <Link
              href={registerHref}
              className="italic text-foreground font-semibold hover:text-amber-700 dark:hover:text-primary transition-colors"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
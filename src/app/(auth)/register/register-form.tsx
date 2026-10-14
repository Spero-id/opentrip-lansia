"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp, signIn } from "@/lib/auth/client";
import {
  DEFAULT_REDIRECT,
  buildAuthHref,
  readRedirectFromSearch,
} from "@/utils/redirect";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/auth.schema";
import AuthAside from "@/features/auth/components/AuthAside";
import AuthTextField from "@/features/auth/components/AuthTextField";
import PasswordField from "@/features/auth/components/PasswordField";
import SocialLoginButton from "@/features/auth/components/SocialLoginButton";
import { Button } from "@/components/ui/button";

function getServerSnapshot() {
  return DEFAULT_REDIRECT;
}

function getClientSnapshot() {
  return readRedirectFromSearch(window.location.search, {
    allowAdmin: false,
  });
}

const emptySubscribe = () => () => {};

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectPath = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const loginHref = buildAuthHref("/login", redirectPath);

  async function onSubmit(values: RegisterInput) {
    setError("");

    const { error: signUpError } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (signUpError) {
      setError(signUpError.message || "Gagal mendaftar, coba lagi.");
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
    <div className="fixed inset-0 overflow-hidden lg:static lg:h-screen bg-background flex flex-col lg:flex">
      <div className="flex flex-col flex-1 min-h-0 lg:h-full lg:flex-none w-full lg:grid lg:grid-cols-2 lg:grid-rows-1 overflow-hidden">

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

        {/* Auto margins center the form vertically when it fits, and collapse to 0 on
            overflow so the column stays scrollable from the very top (justify-content
            would keep centering and clip the top away). */}
        <div className="order-2 lg:order-2 relative flex-1 min-h-0 overflow-y-auto bg-background p-10 flex flex-col [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto lg:w-full lg:mx-auto lg:max-w-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
          >
            <ArrowLeft size={14} />
            Kembali ke Beranda
          </Link>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            Daftar untuk mulai merencanakan trip berikutnya.
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
              label="Nama Lengkap"
              placeholder="Masukkan nama kamu"
              error={errors.name?.message}
              {...register("name", { onChange: () => clearErrors("name") })}
            />

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

            <PasswordField
              label="Konfirmasi Password"
              placeholder="Masukkan konfirmasi password kamu"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", { onChange: () => clearErrors("confirmPassword") })}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              variant="default"
              className="w-full"
            >
              {isSubmitting ? "Memproses..." : "Daftar"}
            </Button>
          </form>

          <SocialLoginButton
            onClick={handleGoogleLogin}
            loading={googleLoading}
            label="Daftar dengan Google"
          />

          <p className="text-center text-sm text-muted-foreground mt-8">
            Sudah Punya Akun?{" "}
            <Link
              href={loginHref}
              className="italic text-foreground font-semibold hover:text-amber-700 dark:hover:text-primary transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
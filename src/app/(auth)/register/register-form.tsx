"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/auth/client";
import { buildAuthHref } from "@/utils/redirect";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/auth.schema";
import { translateAuthError } from "@/features/auth/auth-errors";
import AuthAside from "@/features/auth/components/AuthAside";
import AuthShell from "@/features/auth/components/AuthShell";
import AuthErrorAlert from "@/features/auth/components/AuthErrorAlert";
import AuthTextField from "@/features/auth/components/AuthTextField";
import PasswordField from "@/features/auth/components/PasswordField";
import SocialLoginButton from "@/features/auth/components/SocialLoginButton";
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect";
import { useGoogleSignIn } from "@/features/auth/hooks/use-google-sign-in";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const redirectPath = useAuthRedirect({ allowAdmin: false });
  const { googleLoading, handleGoogleLogin } = useGoogleSignIn(redirectPath, setError);

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
      setError(translateAuthError(signUpError.message, "Gagal mendaftar, coba lagi."));
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return (
    <AuthShell
      contentClassName="order-2 lg:order-2"
      aside={
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
      }
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
        Buat Akun Baru
      </h1>
      <p className="text-muted-foreground text-sm mb-4">
        Daftar untuk mulai merencanakan trip berikutnya.
      </p>

      <AuthErrorAlert message={error} />

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <p className="text-center text-sm text-muted-foreground mt-4">
        Sudah Punya Akun?{" "}
        <Link
          href={loginHref}
          className="text-primary font-bold hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
    </AuthShell>
  );
}

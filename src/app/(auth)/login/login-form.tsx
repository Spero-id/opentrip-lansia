"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth/client";
import { buildAuthHref } from "@/utils/redirect";
import { loginSchema, type LoginInput } from "@/features/auth/auth.schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  // Session preference, not a validated credential - lives outside the zod
  // schema so loginSchema keeps meaning "are these credentials acceptable".
  const [rememberMe, setRememberMe] = useState(true);
  const redirectPath = useAuthRedirect({ allowAdmin: true });
  const { googleLoading, handleGoogleLogin } = useGoogleSignIn(redirectPath, setError);

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

    const { error: signInError } = await signIn.email({ ...values, rememberMe });

    if (signInError) {
      setError(translateAuthError(signInError.message, "Email atau password salah"));
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return (
    <AuthShell
      aside={
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
      }
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
        Selamat Datang Kembali
      </h1>
      <p className="text-muted-foreground text-sm mb-4">
        Masuk untuk mulai merencanakan trip berikutnya.
      </p>

      <AuthErrorAlert message={error} />

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
            />
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
          className="w-full"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <SocialLoginButton
        onClick={handleGoogleLogin}
        loading={googleLoading}
        label="Masuk dengan Google"
      />

      <p className="text-center text-sm text-muted-foreground mt-4">
        Belum punya akun?{" "}
        <Link
          href={registerHref}
          className="text-primary font-bold hover:underline"
        >
          Daftar di sini
        </Link>
      </p>
    </AuthShell>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeRedirectPath } from "@/utils/redirect";
import LoginForm from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    return <LoginForm />;
  }

  const { redirect: target } = await searchParams;
  redirect(
    sanitizeRedirectPath(typeof target === "string" ? target : null, {
      allowAdmin: true,
    })
  );
}

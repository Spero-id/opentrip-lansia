import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeRedirectPath } from "@/utils/redirect";
import RegisterForm from "./register-form";

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string | string[] }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    return <RegisterForm />;
  }

  const { redirect: target } = await searchParams;
  redirect(
    sanitizeRedirectPath(typeof target === "string" ? target : null, {
      allowAdmin: false,
    })
  );
}

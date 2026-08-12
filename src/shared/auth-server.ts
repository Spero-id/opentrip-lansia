import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth.config";

export async function requireAdminLayout() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login?redirect=" + encodeURIComponent("/admin"));
  }

  const user = session.user as typeof session.user & { role?: string };
  if (user.role !== "admin") {
    redirect("/forbidden");
  }

  return session;
}
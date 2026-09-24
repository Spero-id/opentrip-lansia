import { requireAdminLayout } from "@/shared/auth-server";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminLayout();
  return <AdminShell>{children}</AdminShell>;
}

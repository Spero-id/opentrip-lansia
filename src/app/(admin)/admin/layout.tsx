import { requireAdminLayout } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminLayout();
  return <AdminShell>{children}</AdminShell>;
}

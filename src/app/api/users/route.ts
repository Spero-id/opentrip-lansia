import { NextRequest } from "next/server";
import { userController } from "@/features/auth/user.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return userController.list();
}

import { NextRequest } from "next/server";
import { masterController } from "@/features/master/master.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return masterController.listHoreca();
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return masterController.createHoreca(req);
}

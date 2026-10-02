import { NextRequest } from "next/server";
import { promotionController } from "@/features/promotion/promotion.controller";
import { requireAdmin, requireSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  return promotionController.list();
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return promotionController.create(req);
}

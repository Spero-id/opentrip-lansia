import { privateTripController } from "@/features/private-trip/private-trip.controller";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const params = await context.params;
  return privateTripController.createProposal(req, { params });
}

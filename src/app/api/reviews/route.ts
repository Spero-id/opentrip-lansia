import { NextRequest } from "next/server";
import { reviewController } from "@/features/review/review.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const statusParam = searchParams.get("status");
  const tripIdParam = searchParams.get("tripId");
  if (statusParam === "approved" || tripIdParam) {
    if (tripIdParam) return reviewController.listApprovedByTrip(tripIdParam);
    return reviewController.listApproved();
  }
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return reviewController.listAll();
}

export async function POST(req: NextRequest) {
  return reviewController.create(req);
}

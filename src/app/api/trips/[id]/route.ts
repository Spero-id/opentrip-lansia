import { NextRequest } from "next/server";
import { tripController } from "@/modules/trip/trip.controller";
import { requireAdmin } from "@/shared/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return tripController.PUT(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return tripController.DELETE(req, { params });
}

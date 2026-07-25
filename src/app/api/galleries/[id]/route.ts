import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tripGalleries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [gallery] = await db.select().from(tripGalleries).where(eq(tripGalleries.id, id)).limit(1);
  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(gallery);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [gallery] = await db.update(tripGalleries).set(body).where(eq(tripGalleries.id, id)).returning();
  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(gallery);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(tripGalleries).where(eq(tripGalleries.id, id));
  return NextResponse.json({ message: "deleted" });
}

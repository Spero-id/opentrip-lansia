import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tripGalleries } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const list = await db.select().from(tripGalleries).orderBy(desc(tripGalleries.createdAt));
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [gallery] = await db.insert(tripGalleries).values(body).returning();
  return NextResponse.json(gallery, { status: 201 });
}

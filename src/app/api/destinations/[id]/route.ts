import { NextRequest, NextResponse } from "next/server";
import { masterRepository } from "@/modules/master/master.repository";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dest = await masterRepository.getDestinationById(id);
  if (!dest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dest);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const dest = await masterRepository.updateDestination(id, body);
  if (!dest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dest);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await masterRepository.deleteDestination(id);
  return NextResponse.json({ message: "deleted" });
}

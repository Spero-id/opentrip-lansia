import { NextRequest, NextResponse } from "next/server";
import { masterRepository } from "@/modules/master/master.repository";
import { slugify } from "@/shared/utils/helpers";

export async function GET() {
  const list = await masterRepository.getDestinations();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.slug || slugify(body.name) + "-" + Date.now();
  const dest = await masterRepository.createDestination({ ...body, slug });
  return NextResponse.json(dest, { status: 201 });
}

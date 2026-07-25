import { NextResponse } from "next/server";
import { masterRepository } from "@/modules/master/master.repository";

export async function GET() {
  const categories = await masterRepository.getDestinationCategories();
  return NextResponse.json(categories);
}

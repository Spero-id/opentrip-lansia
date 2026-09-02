import { NextRequest } from "next/server";
import { newsletterController } from "@/modules/newsletter/newsletter.controller";

export async function POST(req: NextRequest) {
  return newsletterController.subscribe(req);
}
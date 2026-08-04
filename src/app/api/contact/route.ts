import { NextRequest } from "next/server";
import { contactController } from "@/modules/contact/contact.controller";

export async function POST(req: NextRequest) {
  return contactController.create(req);
}

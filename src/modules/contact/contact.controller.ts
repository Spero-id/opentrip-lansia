import { NextRequest, NextResponse } from "next/server";
import { contactService } from "./contact.service";

export const contactController = {
  async create(req: NextRequest) {
    const body = await req.json();
    const msg = await contactService.submitMessage(body);
    return NextResponse.json(msg);
  },
};

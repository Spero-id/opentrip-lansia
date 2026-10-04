import { NextRequest, NextResponse } from "next/server";
import { contactService } from "./contact.service";
import { AppError } from "@/utils/errors/app-error";
import { toPublicError } from "@/utils/errors/to-public-error";

export const contactController = {
  async create(req: NextRequest) {
    try {
      const body = await req.json();
      const msg = await contactService.submitMessage(body);
      return NextResponse.json(msg, { status: 201 });
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      const message = toPublicError(err, "Terjadi kesalahan");
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
};

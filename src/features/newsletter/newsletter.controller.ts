import { NextRequest, NextResponse } from "next/server";
import { subscribeService } from "./newsletter.service";
import { AppError } from "@/lib/errors/app-error";
import { toPublicError } from "@/lib/errors/to-public-error";

export const newsletterController = {
  async subscribe(req: NextRequest) {
    try {
      const body = await req.json();
      const subscriber = await subscribeService.subscribe(body);
      return NextResponse.json(subscriber, { status: 201 });
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      const message = toPublicError(err, "Terjadi kesalahan");
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
};
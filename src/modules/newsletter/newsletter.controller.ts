import { NextRequest, NextResponse } from "next/server";
import { subscribeService } from "./newsletter.service";
import { AppError } from "@/shared/errors/app-error";

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
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
};
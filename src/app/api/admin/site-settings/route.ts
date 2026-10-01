import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { siteSettingsService } from "@/features/site-settings/site-settings.service";
import { toPublicError } from "@/lib/errors/to-public-error";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const settings = await siteSettingsService.getAllSettings();
    return NextResponse.json(settings);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "key dan value wajib diisi" }, { status: 400 });
    }

    if (key === "referral_bonus_points") {
      const numVal = parseInt(String(value), 10);
      if (isNaN(numVal) || numVal < 0) {
        return NextResponse.json({ error: "Nilai harus berupa angka positif" }, { status: 400 });
      }
      await siteSettingsService.setReferralBonusPoints(numVal);
    } else {
      return NextResponse.json({ error: "Setting tidak dikenali" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

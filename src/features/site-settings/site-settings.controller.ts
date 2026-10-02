import { NextRequest, NextResponse } from "next/server";
import { siteSettingsService } from "./site-settings.service";
import { toPublicError } from "@/lib/errors/to-public-error";

export const siteSettingsController = {
  async list() {
    try {
      return NextResponse.json(await siteSettingsService.getAllSettings());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async update(req: NextRequest) {
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
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async getReferralBonus() {
    try {
      const points = await siteSettingsService.getReferralBonusPoints();
      return NextResponse.json({ referralBonusPoints: points });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },
};

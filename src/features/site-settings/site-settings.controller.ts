import { NextRequest, NextResponse } from "next/server";
import { siteSettingsService } from "./site-settings.service";
import { toPublicError } from "@/utils/errors/to-public-error";
import { auditService, pickFields } from "@/features/audit";
import { getSessionUser } from "@/lib/auth";

const SETTINGS_AUDIT_FIELDS = ["key", "value"] as const;

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
        const before = await siteSettingsService.getSetting(key);
        await siteSettingsService.setReferralBonusPoints(numVal);
        const after = await siteSettingsService.getSetting(key);
        if (before?.value !== after?.value) {
          await auditService.record({
            adminId: (await getSessionUser(req))?.id ?? null,
            action: "update",
            entityType: "site_settings",
            entityId: key,
            oldValues: pickFields(before, SETTINGS_AUDIT_FIELDS),
            newValues: pickFields(after, SETTINGS_AUDIT_FIELDS),
            description: `Pengaturan "${key}" diubah`,
          });
        }
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

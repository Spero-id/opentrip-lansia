/**
 * Backfill referral codes for existing users who don't have one.
 * Run with: npx tsx src/db/backfill-referral-codes.ts
 */
import { db } from "@/shared/db";
import { users } from "@/modules/auth/auth.schema";
import { eq, isNull } from "drizzle-orm";
import { generateCode } from "@/shared/utils/helpers";

async function main() {
  console.log("🔍 Finding users without referral codes...");

  const usersWithoutCode = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(isNull(users.referralCode));

  console.log(`📋 Found ${usersWithoutCode.length} users without referral codes`);

  if (usersWithoutCode.length === 0) {
    console.log("✅ All users already have referral codes");
    return;
  }

  let updated = 0;
  for (const user of usersWithoutCode) {
    const referralCode = generateCode("OTL");
    await db
      .update(users)
      .set({ referralCode })
      .where(eq(users.id, user.id));

    console.log(`  ✅ ${user.email} → ${referralCode}`);
    updated++;
  }

  console.log(`\n🎉 Done! Updated ${updated} users with new referral codes`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

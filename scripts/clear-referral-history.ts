import { db } from "@/shared/db";
import { referrals, commissions, commissionPayouts, payoutCommissions } from "@/modules/referral/referral.schema";
import { sql } from "drizzle-orm";

async function clearReferralHistory() {
  console.log("🗑️  Clearing all referral history data...\n");

  try {
    // Use raw SQL to avoid foreign key issues
    console.log("1. Deleting payout_commissions...");
    await db.execute(sql`DELETE FROM payout_commissions`);
    
    console.log("2. Deleting commission_payouts...");
    await db.execute(sql`DELETE FROM commission_payouts`);
    
    console.log("3. Deleting commissions...");
    await db.execute(sql`DELETE FROM commissions`);
    
    console.log("4. Deleting referrals...");
    await db.execute(sql`DELETE FROM referrals`);

    console.log("\n✅ All referral history data has been deleted!\n");

    // Verify
    const referralResult = await db.execute(sql`SELECT COUNT(*) as count FROM referrals`);
    const commissionResult = await db.execute(sql`SELECT COUNT(*) as count FROM commissions`);
    
    console.log("📊 Verification:");
    console.log(`   - Referrals: ${referralResult.rows?.[0]?.count ?? 0} rows`);
    console.log(`   - Commissions: ${commissionResult.rows?.[0]?.count ?? 0} rows`);
    
  } catch (error) {
    console.error("❌ Error clearing referral history:", error);
    process.exit(1);
  }
}

clearReferralHistory();

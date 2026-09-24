-- Clear all referral history data
-- WARNING: This will permanently delete all referral and commission data

BEGIN;

-- Disable foreign key checks temporarily (if needed)
-- DELETE FROM payout_commissions WHERE payout_id IN (SELECT id FROM commission_payouts);
-- DELETE FROM commission_payouts;

-- Delete related records first (foreign key dependencies)
DELETE FROM payout_commissions;
DELETE FROM commission_payouts;
DELETE FROM commissions;
DELETE FROM referrals;

-- Reset sequences if any (PostgreSQL uses UUID so this is optional)
-- ALTER SEQUENCE referrals_id_seq RESTART WITH 1;
-- ALTER SEQUENCE commissions_id_seq RESTART WITH 1;

COMMIT;

-- Verify deletion
SELECT 'referrals' as table_name, COUNT(*) as remaining_rows FROM referrals
UNION ALL
SELECT 'commissions', COUNT(*) FROM commissions
UNION ALL
SELECT 'commission_payouts', COUNT(*) FROM commission_payouts
UNION ALL
SELECT 'payout_commissions', COUNT(*) FROM payout_commissions;

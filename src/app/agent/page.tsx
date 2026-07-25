import { db } from "@/shared/db";
import { referrals, commissions } from "@/modules/referral/referral.schema";
import { eq, desc } from "drizzle-orm";
import CopyButton from "@/components/copy-button";

const AGENT_ID = "00000000-0000-0000-0000-000000000000";

export default async function AgentDashboard() {
  const referralCount = (await db.select().from(referrals).where(eq(referrals.referrerId, AGENT_ID))).length;
  const commissionRows = await db.select().from(commissions).where(eq(commissions.agentId, AGENT_ID)).orderBy(desc(commissions.createdAt)).limit(20);
  const totalCommission = commissionRows.reduce((s, c) => s + parseInt(c.amount), 0);
  const paidCommission = commissionRows.filter((c) => c.status === "paid").reduce((s, c) => s + parseInt(c.amount), 0);
  const referralLink = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/register?ref=AGENT-${AGENT_ID.slice(0, 8)}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Dashboard Agen</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-primary">{referralCount}</p>
          <p className="text-sm text-gray-500">Referral</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-primary">Rp {(totalCommission - paidCommission).toLocaleString("id-ID")}</p>
          <p className="text-sm text-gray-500">Komisi Tertunda</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">Rp {paidCommission.toLocaleString("id-ID")}</p>
          <p className="text-sm text-gray-500">Komisi Dibayar</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border p-4">
        <h2 className="font-semibold">Tautan Referral</h2>
        <div className="mt-2 flex gap-2">
          <input readOnly value={referralLink} className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 font-mono text-sm" />
          <CopyButton text={referralLink} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Riwayat Komisi</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {commissionRows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-medium">Rp {parseInt(c.amount).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.createdAt?.toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

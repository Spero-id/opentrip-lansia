"use client";

export default function ProfileInfoCard({ user }) {
  const rows = [
    { label: "Nama", value: user?.name },
    { label: "Email", value: user?.email },
    { label: "No. HP", value: user?.phone || "-" },
    { label: "Role", value: user?.role || "user" },
    { label: "Kode Referral", value: user?.referralCode || "-" },
    { label: "Poin Loyalitas", value: user?.loyaltyPoints ?? 0 },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Akun</h2>
      <dl className="divide-y divide-gray-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3">
            <dt className="text-sm text-gray-500">{row.label}</dt>
            <dd className="text-sm font-medium text-gray-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

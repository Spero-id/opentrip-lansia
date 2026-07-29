"use client";

export default function CustomerForm({ customer, setCustomer, onAutofill }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Nama sesuai identitas"
            value={customer.fullName}
            onChange={(e) => setCustomer("fullName", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="nama@email.com"
            value={customer.email}
            onChange={(e) => setCustomer("email", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">No. Telepon</label>
          <input
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            value={customer.phone}
            onChange={(e) => setCustomer("phone", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Catatan Khusus</label>
          <input
            type="text"
            placeholder="Misal: alergi, permintaan khusus"
            value={customer.specialRequest}
            onChange={(e) => setCustomer("specialRequest", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onAutofill}
        className="text-xs text-[#df7224] font-semibold hover:underline"
      >
        Isi data contoh (Autofill)
      </button>
    </div>
  );
}

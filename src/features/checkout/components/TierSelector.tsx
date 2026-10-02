"use client";

import { Minus, Plus } from "lucide-react";
import { OrderDomain } from "@/lib/order";
import type { TierOption } from "@/features/checkout/types";

interface TierSelectorProps {
  tiers: TierOption[];
  tierQty: Record<string, number>;
  loading: boolean;
  onChange: (priceId: string, qty: number) => void;
}

export default function TierSelector({ tiers, tierQty, loading, onChange }: TierSelectorProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-1">Jumlah Peserta</h2>
        <p className="text-xs text-gray-400">Memuat tier harga...</p>
      </div>
    );
  }
  if (tiers.length === 0) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-gray-900">Jumlah Peserta</h2>
        <p className="text-xs text-gray-400">Atur jumlah peserta per tier harga.</p>
      </div>
      <div className="space-y-3">
        {tiers.map((tier) => {
          const qty = tierQty[tier.id] ?? 0;
          const soldOut = tier.remaining <= 0;
          return (
            <div key={tier.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{tier.name}</p>
                <p className="text-xs text-gray-500">
                  {OrderDomain.formatPrice(tier.price)} · sisa {tier.remaining}
                  {tier.validUntil ? ` · s/d ${tier.validUntil}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  aria-label={`Kurangi ${tier.name}`}
                  disabled={qty <= 0}
                  onClick={() => onChange(tier.id, qty - 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#F49D1A] hover:text-[#F49D1A] disabled:opacity-30 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-gray-900 tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label={`Tambah ${tier.name}`}
                  disabled={soldOut || qty >= tier.remaining}
                  onClick={() => onChange(tier.id, qty + 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#F49D1A] hover:text-[#F49D1A] disabled:opacity-30 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

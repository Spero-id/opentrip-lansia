"use client";

import VoucherCard from "./VoucherCard";
import PriceBreakdown from "./PriceBreakdown";
import MeetingPointSelector from "./MeetingPointSelector";
import CustomerForm from "./CustomerForm";
import ParticipantCard from "./ParticipantCard";
import BookingSummary from "./BookingSummary";

export default function DetailsStep({ checkout, onNext }) {
  const canProceed =
    checkout.destination &&
    checkout.travelDate &&
    checkout.customer?.fullName &&
    checkout.customer?.email &&
    checkout.customer?.phone;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
      <div className="lg:col-span-3 space-y-6">
        <BookingSummary destination={checkout.destination} />

        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Detail Perjalanan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Jumlah Peserta</label>
              <select
                value={checkout.pax}
                onChange={(e) => checkout.setPax(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n} Orang</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Keberangkatan</label>
              <input
                type="date"
                value={checkout.travelDate}
                onChange={(e) => checkout.setTravelDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/20"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Data Pemesan</h2>
          <CustomerForm customer={checkout.customer} setCustomer={checkout.setCustomer} onAutofill={checkout.autofillProfile} />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">
            Data Peserta ({checkout.pax} Orang)
          </h2>
          <p className="text-xs text-gray-400">
            Mohon isi data diri peserta dengan benar untuk keperluan tiket dan asuransi perjalanan.
          </p>
          <div className="space-y-3">
            {checkout.participants.map((p, idx) => (
              <ParticipantCard key={p.id} participant={p} index={idx} onUpdate={checkout.updateParticipant} />
            ))}
          </div>
        </div>

        <MeetingPointSelector meetingPointId={checkout.meetingPointId} onChange={checkout.setMeetingPointId} />

        <VoucherCard
          voucherCode={checkout.voucherCode}
          setVoucherCode={checkout.setVoucherCode}
          appliedVoucher={checkout.appliedVoucher}
          voucherError={checkout.voucherError}
          onApply={checkout.applyVoucher}
          onRemove={checkout.removeVoucher}
        />
      </div>

      <div className="lg:col-span-2">
        <PriceBreakdown
          destination={checkout.destination}
          pax={checkout.pax}
          ticketSubtotal={checkout.ticketSubtotal}
          meetingPointFee={checkout.meetingPointFee}
          serviceFee={checkout.serviceFee}
          discount={checkout.discount}
          total={checkout.total}
          appliedVoucher={checkout.appliedVoucher}
          agreeToTerms={checkout.agreeToTerms}
          setAgreeToTerms={checkout.setAgreeToTerms}
          canProceed={canProceed}
          onNext={onNext}
        />
      </div>
    </div>
  );
}

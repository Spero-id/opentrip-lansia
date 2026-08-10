"use client";

import VoucherCard from "./VoucherCard";
import PriceBreakdown from "./PriceBreakdown";
import MeetingPointInfo from "./MeetingPointInfo";
import CustomerForm from "./CustomerForm";
import BookingSummary from "./BookingSummary";

export default function DetailsStep({ checkout, onNext }) {
  const canProceed =
    checkout.destination &&
    checkout.customer?.fullName &&
    checkout.customer?.phone &&
    checkout.customer?.address &&
    checkout.customer?.emergencyContactName &&
    checkout.customer?.emergencyContactPhone;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
      <div className="lg:col-span-3 space-y-6">
        <BookingSummary destination={checkout.destination} />

        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Data Pemesan & Kesehatan</h2>
          <p className="text-xs text-gray-400">
            Mohon isi data diri dan kondisi kesehatan peserta dengan benar untuk keperluan tiket dan
            asuransi perjalanan.
          </p>
          <CustomerForm
            customer={checkout.customer}
            setCustomer={checkout.setCustomer}
            onAutofill={checkout.autofillProfile}
          />
        </div>

        <MeetingPointInfo destination={checkout.destination} />

        <VoucherCard
          voucherCode={checkout.voucherCode}
          setVoucherCode={checkout.setVoucherCode}
          onApply={checkout.applyVoucher}
          onRemove={checkout.removeVoucher}
          appliedVoucher={checkout.appliedVoucher}
          voucherError={checkout.voucherError}
        />
      </div>

      <div className="lg:col-span-2">
        <PriceBreakdown
          destination={checkout.destination}
          pricePerPax={checkout.destination?.priceMin ?? 0}
          pax={checkout.pax}
          ticketSubtotal={checkout.ticketSubtotal}
          serviceFee={checkout.serviceFee}
          total={checkout.total}
          discount={checkout.discount}
          appliedVoucher={checkout.appliedVoucher}
          agreeToTerms={checkout.agreeToTerms}
          setAgreeToTerms={checkout.setAgreeToTerms}
          canProceed={canProceed}
          onNext={onNext}
          isLoading={checkout.isLoading}
        />
      </div>
    </div>
  );
}

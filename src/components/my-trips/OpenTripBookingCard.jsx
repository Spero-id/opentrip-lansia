"use client";

import { useState } from "react";
import {
  A,
  OPEN_TRIP_STATUS_LABEL,
  OPEN_TRIP_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_COLOR,
  formatRupiah,
  icons,
} from "./constants";

export default function OpenTripBookingCard({ booking }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  let notesObj = {};
  if (booking.notes) {
    try {
      notesObj = typeof booking.notes === "string" ? JSON.parse(booking.notes) : booking.notes;
    } catch {
      notesObj = { raw: booking.notes };
    }
  }

  const destinationName  = notesObj.destinationName  || "Paket Open Trip";
  const travelDate       = notesObj.travelDate       || null;
  const customerName     = notesObj.customerName     || null;
  const customerEmail    = notesObj.customerEmail    || null;
  const customerPhone    = notesObj.customerPhone    || null;
  const specialRequest   = notesObj.specialRequest   || null;
  const adminMessage     = notesObj.adminMessage     || null;

  const paymentStatus   = booking.payments?.[0]?.status || booking.status || "confirmed";
  const paymentMethod   = booking.payments?.[0]?.method || "online";
  const paymentProof    = booking.payments?.[0]?.proofUrl || booking.payments?.[0]?.gatewayResponse?.proofUrl || null;
  const paymentAdminNote = booking.payments?.[0]?.adminNote || null;

  const copyCode = (e) => {
    e.stopPropagation();
    if (booking.bookingCode) {
      navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Header */}
      <div
        id={`open-trip-card-${booking.id}`}
        role="button"
        tabIndex={0}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-[#F49D1A] border border-[#F49D1A]/30">
              Open Trip
            </span>
            <p className="text-sm font-bold text-gray-900 truncate">{destinationName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 font-mono text-gray-700 bg-gray-100 rounded px-2 py-0.5">
              {booking.bookingCode}
              <button onClick={copyCode} title="Salin Kode Booking" className="hover:text-gray-900 transition p-0.5">
                {copied ? icons.copied : icons.copy}
              </button>
            </span>
            {travelDate && (
              <>
                <span>·</span>
                <span>Tgl Perjalanan: <strong className="text-gray-700">{travelDate}</strong></span>
              </>
            )}
            <span>·</span>
            <span>{booking.totalParticipants} Peserta</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <div className="text-right">
            <p className="text-sm font-extrabold" style={{ color: A }}>
              {formatRupiah(booking.totalAmount) || "IDR " + booking.totalAmount}
            </p>
            <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${OPEN_TRIP_STATUS_COLOR[booking.status] || "bg-teal-100 text-teal-800"}`}>
              {OPEN_TRIP_STATUS_LABEL[booking.status] || booking.status}
            </span>
          </div>
          {booking.status === "pending_payment" && (
            <a
              href={`/checkout/pay/${booking.id}`}
              className="px-4 py-2 bg-[#F49D1A] text-white text-xs font-bold rounded-lg hover:bg-[#c47d12] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Bayar
            </a>
          )}
          <span className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            {icons.chevron}
          </span>
        </div>
      </div>

      {/* Detail */}
      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4 bg-gray-50/30">
          {/* WhatsApp Admin */}
          {(() => {
            const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
            if (!waNumber) return null;
            const waMsg = encodeURIComponent(
              `Halo Admin Jelajah Memoria, saya ingin bertanya tentang booking saya.\n\nKode Booking: ${booking.bookingCode}\nDestinasi: ${destinationName}`
            );
            return (
              <a
                href={`https://wa.me/${waNumber}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#25D366] text-white text-xs font-bold rounded-xl transition"
              >
                <img src="/whatsapp-logo.webp" alt="WhatsApp" className="w-6 h-6 object-contain" />
                Hubungi Admin
              </a>
            );
          })()}

          {/* Rincian Pembayaran */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rincian Pembayaran</p>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal ({booking.totalParticipants} pax)</span>
              <span>{formatRupiah(booking.subtotal) || booking.subtotal}</span>
            </div>
            {Number(booking.discountAmount) > 0 && (
              <div className="flex justify-between text-xs text-teal-600 font-medium">
                <span>Diskon Voucher</span>
                <span>-{formatRupiah(booking.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold text-gray-900">
              <span>Total Pembayaran</span>
              <span style={{ color: A }}>{formatRupiah(booking.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
              <span>Metode: <strong className="uppercase">{paymentMethod}</strong></span>
              <span>
                Status Pembayaran:{" "}
                <strong className={`capitalize ${PAYMENT_STATUS_COLOR[paymentStatus] || "text-gray-700"}`}>
                  {PAYMENT_STATUS_LABEL[paymentStatus] || paymentStatus}
                </strong>
              </span>
            </div>
          </div>

          {/* Bukti Pembayaran */}
          {paymentProof && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Bukti Pembayaran</p>
              <a href={paymentProof} target="_blank" rel="noopener noreferrer" className="block">
                <img src={paymentProof} alt="Bukti pembayaran" className="w-full max-h-64 object-contain bg-gray-50 rounded-lg border border-gray-200" />
              </a>
            </div>
          )}

          {paymentAdminNote && (
            <div className="bg-white rounded-xl border border-amber-100 p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan Admin</p>
              <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">{paymentAdminNote}</p>
            </div>
          )}

          {adminMessage && (
            <div className="bg-white rounded-xl border border-blue-100 p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Pesan dari Admin</p>
              <p className="text-xs text-blue-800 bg-blue-50 rounded-lg px-3 py-2">{adminMessage}</p>
            </div>
          )}

          {/* Kontak Pemesan */}
          {(customerName || customerEmail || customerPhone) && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Kontak Pemesan</p>
              {customerName && (
                <div className="flex text-xs">
                  <span className="w-28 text-gray-400 shrink-0">Nama Pemesan</span>
                  <span className="font-semibold text-gray-800">{customerName}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex text-xs">
                  <span className="w-28 text-gray-400 shrink-0">No. WhatsApp</span>
                  <span className="text-gray-700">{customerPhone}</span>
                </div>
              )}
              {customerEmail && (
                <div className="flex text-xs">
                  <span className="w-28 text-gray-400 shrink-0">Email</span>
                  <span className="text-gray-700">{customerEmail}</span>
                </div>
              )}
              {specialRequest && (
                <div className="flex text-xs pt-1">
                  <span className="w-28 text-gray-400 shrink-0">Catatan</span>
                  <span className="text-amber-800 font-medium bg-amber-50 rounded px-2 py-0.5">{specialRequest}</span>
                </div>
              )}
            </div>
          )}

          {/* Daftar Peserta */}
          {booking.participants && booking.participants.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                Daftar Peserta ({booking.participants.length} Orang)
              </p>
              <div className="space-y-2">
                {booking.participants.map((p, idx) => (
                  <div key={p.id || idx} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-[#F49D1A] font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-gray-800">{p.fullName}</span>
                      {p.isPrimary && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                          Pemesan Utama
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500">{p.phone || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

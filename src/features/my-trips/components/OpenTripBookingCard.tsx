"use client";

import { useState, type MouseEvent } from "react";
import { NEXT_PUBLIC_WHATSAPP_NUMBER } from "@/lib/env/client";
import FeedbackModal from "./FeedbackModal";
import GalleryModal from "./GalleryModal";
import type { BookingNotes, MyTripBooking } from "@/features/my-trips";
import {
  OPEN_TRIP_STATUS_LABEL,
  OPEN_TRIP_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_COLOR,
  icons,
} from "./constants";
import { formatIDR } from "@/utils/format";

export default function OpenTripBookingCard({
  booking,
  imageUrl,
  onRefresh,
}: {
  booking: MyTripBooking;
  imageUrl?: string | null;
  onRefresh?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const COPY_TIMEOUT_MS = 2000;

  let notesObj: BookingNotes = {};
  if (booking.notes) {
    try {
      notesObj = typeof booking.notes === "string" ? (JSON.parse(booking.notes) as BookingNotes) : booking.notes;
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

  const isCompleted = booking.status === "completed";
  const hasReview = booking.hasReview || feedbackSubmitted;

  const departureId = booking.departureId || null;

  const tripId = booking.tripId || notesObj.tripId || null;

  const copyCode = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (booking.bookingCode) {
      navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_TIMEOUT_MS);
    }
  };

  const showImage = imageUrl && !imgError;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition">
      <div
        id={`open-trip-card-${booking.id}`}
        role="button"
        tabIndex={0}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-muted/70 transition cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
      >
        {showImage ? (
          <img
            src={imageUrl}
            alt={destinationName}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 bg-muted"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg"
          >
            {destinationName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning-50 text-primary-foreground border border-primary/30">
              Open Trip
            </span>
            <p className="text-sm font-bold text-foreground truncate">{destinationName}</p>
            <p className="text-xs text-muted-foreground">{booking.totalParticipants} Peserta</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-mono text-foreground bg-muted rounded px-2 py-0.5">
              {booking.bookingCode}
              <button onClick={copyCode} title="Salin Kode Booking" className="hover:text-foreground transition p-0.5">
                {copied ? icons.copied : icons.copy}
              </button>
            </span>
            {travelDate && (
              <span>Tgl Perjalanan: <strong className="text-foreground">{travelDate}</strong></span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <div className="text-right">
            <p className="text-sm font-extrabold" style={{ color: "var(--primary-foreground)" }}>
              {formatIDR(booking.totalAmount) ?? "IDR " + booking.totalAmount}
            </p>
            <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${OPEN_TRIP_STATUS_COLOR[booking.status ?? ""] || "bg-teal-100 text-teal-800"}`}>
              {OPEN_TRIP_STATUS_LABEL[booking.status ?? ""] || booking.status}
            </span>
          </div>
          {booking.status === "pending_payment" && (
            <a
              href={`/checkout/pay/${booking.id}`}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Bayar
            </a>
          )}
          {isCompleted && !hasReview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFeedbackOpen(true);
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-lg hover:bg-secondary transition-colors"
            >
              Beri Ulasan
            </button>
          )}
          {isCompleted && hasReview && (
            <span className="px-3 py-1.5 bg-success-100 text-success-700 text-xs font-bold rounded-lg">
              ✓ Sudah Diulas
            </span>
          )}
          {isCompleted && departureId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGalleryOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Lihat Foto
            </button>
          )}
          <span className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            {icons.chevron}
          </span>
        </div>
      </div>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4 bg-muted/30">
          {(() => {
            const waNumber = NEXT_PUBLIC_WHATSAPP_NUMBER;
            if (!waNumber) return null;
            const waMsg = encodeURIComponent(
              `Halo Admin Jelajah Memoria, saya ingin bertanya tentang booking saya.\n\nKode Booking: ${booking.bookingCode}\nDestinasi: ${destinationName}`
            );
            return (
              <a
                href={`https://wa.me/${waNumber}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-success-500 text-success-950 text-xs font-bold rounded-xl transition"
              >
                <img src="/whatsapp-logo.webp" alt="WhatsApp" className="w-6 h-6 object-contain" />
                Hubungi Admin
              </a>
            );
          })()}

          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rincian Pembayaran</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal ({booking.totalParticipants} pax)</span>
              <span>{formatIDR(booking.subtotal) ?? booking.subtotal}</span>
            </div>
            {Number(booking.discountAmount) > 0 && (
              <div className="flex justify-between text-xs text-teal-600 font-medium">
                <span>Diskon Voucher</span>
                <span>-{formatIDR(booking.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
              <span>Total Pembayaran</span>
              <span style={{ color: "var(--primary-foreground)" }}>{formatIDR(booking.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
              <span>Metode: <strong className="uppercase">{paymentMethod}</strong></span>
              <span>
                Status Pembayaran:{" "}
                <strong className={`capitalize ${PAYMENT_STATUS_COLOR[paymentStatus] || "text-foreground"}`}>
                  {PAYMENT_STATUS_LABEL[paymentStatus] || paymentStatus}
                </strong>
              </span>
            </div>
          </div>

          {paymentProof && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Bukti Pembayaran</p>
              <a href={paymentProof} target="_blank" rel="noopener noreferrer" className="block">
                <img src={paymentProof} alt="Bukti pembayaran" className="w-full max-h-64 object-contain bg-muted rounded-lg border border-border" />
              </a>
            </div>
          )}

          {paymentAdminNote && (
            <div className="bg-card rounded-xl border border-warning-100 p-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Catatan Admin</p>
              <p className="text-xs text-warning-800 bg-warning-50 rounded-lg px-3 py-2">{paymentAdminNote}</p>
            </div>
          )}

          {adminMessage && (
            <div className="bg-card rounded-xl border border-info-100 p-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pesan dari Admin</p>
              <p className="text-xs text-info-800 bg-info-50 rounded-lg px-3 py-2">{adminMessage}</p>
            </div>
          )}

          {(customerName || customerEmail || customerPhone) && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kontak Pemesan</p>
              {customerName && (
                <div className="flex text-xs">
                  <span className="w-28 text-muted-foreground shrink-0">Nama Pemesan</span>
                  <span className="font-semibold text-foreground">{customerName}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex text-xs">
                  <span className="w-28 text-muted-foreground shrink-0">No. WhatsApp</span>
                  <span className="text-foreground">{customerPhone}</span>
                </div>
              )}
              {customerEmail && (
                <div className="flex text-xs">
                  <span className="w-28 text-muted-foreground shrink-0">Email</span>
                  <span className="text-foreground">{customerEmail}</span>
                </div>
              )}
              {specialRequest && (
                <div className="flex text-xs pt-1">
                  <span className="w-28 text-muted-foreground shrink-0">Catatan</span>
                  <span className="text-warning-800 font-medium bg-warning-50 rounded px-2 py-0.5">{specialRequest}</span>
                </div>
              )}
            </div>
          )}

          {booking.participants && booking.participants.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Daftar Peserta ({booking.participants.length} Orang)
              </p>
              <div className="space-y-2">
                {booking.participants.map((p, idx) => (
                  <div key={p.id || idx} className="flex items-center justify-between text-xs bg-muted rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-warning-100 text-primary-foreground font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-foreground">{p.fullName}</span>
                      {p.isPrimary && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                          Pemesan Utama
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">{p.phone || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        tripId={tripId}
        departureId={departureId}
        groupLabel={destinationName}
      />

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={async ({ rating, content }) => {
          if (!tripId) {
            throw new Error("Data trip tidak ditemukan. Silakan refresh halaman.");
          }

          const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: booking.id,
              tripId: tripId,
              rating,
              content,
            }),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Gagal mengirim ulasan");
          }
          setFeedbackSubmitted(true);
          setFeedbackOpen(false);
          alert("Terima kasih! Ulasan Anda telah dikirim.");
          if (onRefresh) onRefresh();
        }}
        tripTitle={destinationName}
        bookingCode={booking.bookingCode}
      />
    </div>
  );
}

import { bookingService } from "@/modules/booking/booking.service";
import PaymentForm from "./payment-form";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await bookingService.getBooking(id);

  if (!result) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-gray-500">Booking tidak ditemukan.</div>;

  const { booking, items } = result;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Pembayaran</h1>
      <div className="mt-4 rounded-xl border p-4">
        <p className="text-sm text-gray-500">Kode Booking: <span className="font-mono font-medium text-gray-900">{booking.bookingCode}</span></p>
        <p className="mt-1 text-sm text-gray-500">Status: <span className="capitalize">{booking.status}</span></p>
        <p className="mt-3 text-lg font-semibold">Rp {parseInt(booking.totalAmount).toLocaleString("id-ID")}</p>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex justify-between rounded-lg border p-3 text-sm">
            <span>{i.quantity}x tiket</span>
            <span>Rp {parseInt(i.subtotal).toLocaleString("id-ID")}</span>
          </div>
        ))}
      </div>

      <PaymentForm bookingId={id} amount={booking.totalAmount} />
    </div>
  );
}

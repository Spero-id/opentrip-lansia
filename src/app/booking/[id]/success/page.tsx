import Link from "next/link";

export default function BookingSuccess() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="text-5xl">✔</div>
      <h1 className="mt-4 text-2xl font-bold">Pemesanan Berhasil!</h1>
      <p className="mt-2 text-gray-500">Kami akan menghubungi Anda untuk konfirmasi pembayaran.</p>
      <Link href="/trips" className="mt-6 inline-block rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark">
        Jelajahi Trip Lain
      </Link>
    </div>
  );
}

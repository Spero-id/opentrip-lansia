import TripForm from "../trip-form";

export default function NewTripPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tambah Trip Baru</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Buat paket trip baru untuk ditawarkan kepada peserta.</p>
        <TripForm />
      </div>
    </div>
  );
}

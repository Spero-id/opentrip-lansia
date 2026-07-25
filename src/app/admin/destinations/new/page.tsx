import { masterRepository } from "@/modules/master/master.repository";
import DestinationForm from "../destination-form";

export default async function NewDestinationPage() {
  const categories = await masterRepository.getDestinationCategories();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tambah Destinasi Baru</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Buat lokasi wisata baru untuk OpenTrip Lansia.</p>
        <DestinationForm categories={categories} />
      </div>
    </div>
  );
}

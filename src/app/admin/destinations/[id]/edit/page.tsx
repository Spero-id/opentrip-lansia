import { masterRepository } from "@/modules/master/master.repository";
import { notFound } from "next/navigation";
import DestinationForm from "../../destination-form";

export default async function EditDestinationPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [dest, categories] = await Promise.all([
    masterRepository.getDestinationById(id),
    masterRepository.getDestinationCategories(),
  ]);

  if (!dest) notFound();

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Destinasi</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Perbarui informasi destinasi wisata.</p>
        <DestinationForm initial={dest} categories={categories} />
      </div>
    </div>
  );
}

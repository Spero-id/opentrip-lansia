import SectionCard from "./SectionCard";
import { A } from "./helpers/constants";

function formatRupiah(v) {
  if (!v && v !== 0) return "-";
  return "Rp " + Math.floor(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-50 last:border-b-0">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}

function BlockTitle({ children }) {
  return (
    <p className="text-[11px] font-bold tracking-wide uppercase mb-1 mt-4 first:mt-0" style={{ color: A }}>
      {children}
    </p>
  );
}

export default function SummarySection({ form, budgetValue }) {
  const tripName =
    form.tripType === "custom"
      ? form.customTripName
      : form.selectedDestinasi?.title || form.selectedDestinasi?.name;

  const tanggal = form.tanggal
    ? new Date(form.tanggal).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <SectionCard
      icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <path d="M9 12h6M12 9v6" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      }
      title="Ringkasan Pemesanan"
    >
      <BlockTitle>Pemesan</BlockTitle>
      <Row label="Nama" value={form.nama || "-"} />
      <Row label="Ponsel" value={form.phone || "-"} />
      <Row label="Email" value={form.email || "-"} />
      <Row label="Jumlah Peserta" value={form.jumlahPeserta ? `${form.jumlahPeserta} orang` : "-"} />
      <Row
        label="Asal Pemesanan"
        value={form.tripFrom + (form.namaInstitusi ? ` — ${form.namaInstitusi}` : "")}
      />

      <BlockTitle>Pilihan Trip</BlockTitle>
      <Row label="Tipe Trip" value={form.tripType === "custom" ? "Custom" : "Produk Jelajah Memoria"} />
      <Row label="Nama Trip" value={tripName || "-"} />
      {form.tripType === "explorer" && form.selectedDestinasi?.location && (
        <Row label="Lokasi" value={form.selectedDestinasi.location} />
      )}

      <BlockTitle>Detail Perjalanan</BlockTitle>
      <Row label="Tanggal Keberangkatan" value={tanggal} />
      <Row label="Durasi" value={form.durasi ? `${form.durasi} Hari` : "-"} />
      <Row label="Titik Kumpul" value={form.meetingPoint || "-"} />
      <Row label="Catatan" value={form.catatan || "-"} />
      <Row
        label="Anggaran"
        value={
          budgetValue
            ? `${formatRupiah(budgetValue)} /pax`
            : "Belum ditentukan"
        }
      />
    </SectionCard>
  );
}
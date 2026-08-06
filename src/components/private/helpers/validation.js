export function validate(form) {
  const e = {};

  if (!form.nama.trim())
    e.nama = "Wajib diisi";

  if (!form.phone.trim())
    e.phone = "Wajib diisi";

  if (!form.tanggal)
    e.tanggal = "Wajib diisi";

  if (!form.meetingPoint.trim())
    e.meetingPoint = "Wajib diisi";

  if (!form.catatan.trim())
    e.catatan = "Wajib diisi";

  const jumlahPeserta = parseInt(form.jumlahPeserta, 10);
  if (!form.jumlahPeserta || isNaN(jumlahPeserta) || jumlahPeserta < 6)
    e.jumlahPeserta = "Jumlah peserta minimal 6 orang";
  else if (jumlahPeserta > 10)
    e.jumlahPeserta = "Jumlah peserta maksimal 10 orang";

  if (
    form.tripType === "custom" &&
    !form.customTripName.trim()
  )
    e.customTripName = "Wajib diisi";

  if (
    form.tripType === "explorer" &&
    !form.selectedDestinasi
  )
    e.selectedDestinasi = "Pilih salah satu destinasi";

  if (
    form.tripFrom !== "Individu" &&
    !form.namaInstitusi.trim()
  )
    e.namaInstitusi = "Wajib diisi";

  return e;
}

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

  if (!form.participants || form.participants.length < 1)
    e.peserta = "Tambah minimal 1 peserta";

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

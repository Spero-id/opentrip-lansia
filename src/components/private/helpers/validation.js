export function validate(form) {
  const e = {};

  if (!form.nama.trim())
    e.nama = "Wajib diisi";

  if (!form.phone.trim())
    e.phone = "Wajib diisi";

  if (!form.tanggal && !form.tanggalFleksibel)
    e.tanggal = "Wajib diisi";

  if (!form.meetingPoint.trim())
    e.meetingPoint = "Wajib diisi";

  if (!form.jumlahPeserta || String(form.jumlahPeserta).trim() === "")
    e.jumlahPeserta = "Wajib diisi";

  if (!form.durasi || String(form.durasi).trim() === "")
    e.durasi = "Wajib diisi";

  if (!form.email || !form.email.trim())
    e.email = "Wajib diisi";
  else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim()))
      e.email = "Format email tidak valid";
  }

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

  if (!form.transportNeeds)
    e.transportNeeds = "Wajib diisi";

  if (!form.standarPenginapan || !String(form.standarPenginapan).trim())
    e.standarPenginapan = "Wajib diisi";

  if (!form.metodeKontak || !String(form.metodeKontak).trim())
    e.metodeKontak = "Wajib diisi";

  return e;
}

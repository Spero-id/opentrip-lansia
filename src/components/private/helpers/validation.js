function validateNama(form, e) {
  if (!form.nama.trim()) e.nama = "Wajib diisi";
}

function validatePhone(form, e) {
  if (!form.phone.trim()) e.phone = "Wajib diisi";
}

function validateJumlahPeserta(form, e) {
  const jumlahPeserta = parseInt(form.jumlahPeserta, 10);
  if (!form.jumlahPeserta || isNaN(jumlahPeserta) || jumlahPeserta < 1)
    e.jumlahPeserta = "Jumlah peserta wajib diisi";
}

function validateNamaInstitusi(form, e) {
  if (form.tripFrom !== "Individu" && !form.namaInstitusi.trim())
    e.namaInstitusi = "Wajib diisi";
}

function validateTripOption(form, e) {
  if (form.tripType === "custom" && !form.customTripName.trim())
    e.customTripName = "Wajib diisi";

  if (form.tripType === "explorer" && !form.selectedDestinasi)
    e.selectedDestinasi = "Pilih salah satu destinasi";
}

function validateTripDetail(form, e) {
  if (!form.tanggal) e.tanggal = "Wajib diisi";

  if (!form.meetingPoint.trim()) e.meetingPoint = "Wajib diisi";

  if (!form.catatan.trim()) e.catatan = "Wajib diisi";
}

export function validate(form) {
  const e = {};

  validateNama(form, e);
  validatePhone(form, e);
  validateJumlahPeserta(form, e);
  validateNamaInstitusi(form, e);
  validateTripOption(form, e);
  validateTripDetail(form, e);

  return e;
}

/**
 * Memvalidasi hanya field yang termasuk dalam satu langkah wizard.
 * Langkah:
 *   1 = Pemesan        (nama, phone, jumlahPeserta, namaInstitusi)
 *   2 = Pilihan Trip   (tripType, customTripName, selectedDestinasi)
 *   3 = Detail Trip    (tanggal, meetingPoint, catatan)
 *   4 = Konfirmasi     (tidak ada field yang divalidasi)
 */
export function validateStep(form, step) {
  const e = {};

  if (step === 1) {
    validateNama(form, e);
    validatePhone(form, e);
    validateJumlahPeserta(form, e);
    validateNamaInstitusi(form, e);
  } else if (step === 2) {
    validateTripOption(form, e);
  } else if (step === 3) {
    validateTripDetail(form, e);
  }

  return e;
}
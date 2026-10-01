import type { PrivateTripForm } from "../../types";

export const initialForm: PrivateTripForm = {
  nama: "",
  phone: "",
  email: "",
  budget: "",
  tanggal: "",
  tanggalFleksibel: false,
  durasi: "",
  meetingPoint: "",
  catatan: "",
  tripType: "custom",
  customTripName: "",
  selectedDestinasi: null,
  tripFrom: "Individu",
  namaInstitusi: "",
  jumlahPeserta: "",
  transportNeeds: "",
  standarPenginapan: "",
  layananTambahan: [],
  metodeKontak: "whatsapp",
};


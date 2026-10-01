import type {
  PrivateTripDestination,
  PrivateTripForm,
  PrivateTripPayload,
} from "../types";

export function normalizeDestinations(data: unknown): PrivateTripDestination[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  return data
    .filter((item) => item?.status === "published")
    .map((item) => ({
      ...item,
      title: item.title || item.name,
      image: item.image || null,
      isSeniorFriendly: item.isSeniorFriendly ?? false,
      priceMin: item.priceMin ?? 0,
      priceMax: item.priceMax ?? 0,
      location: item.location || "Indonesia",
      rating: item.rating ?? null,
    }));
}

export async function fetchDestinations(): Promise<PrivateTripDestination[]> {
  const res = await fetch("/api/trips");
  if (!res.ok) return [];
  try {
    return normalizeDestinations(await res.json());
  } catch {
    return [];
  }
}

export async function submitPrivateTripRequest(
  payload: PrivateTripPayload,
): Promise<{ id: string | null }> {
  let res: Response;
  try {
    res = await fetch("/api/private-trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
  }
  if (!res.ok) {
    let data: { error?: string; errors?: { message?: string }[] } = {};
    try {
      data = await res.json();
    } catch {}
    const message =
      res.status === 401
        ? "Anda harus login untuk mengirim permintaan."
        : data?.error || data?.errors?.[0]?.message || "Terjadi kesalahan. Silakan coba lagi.";
    throw new Error(message);
  }
  let responseData: { id?: string | null } = {};
  try {
    responseData = await res.json();
  } catch {}
  return { id: responseData.id || null };
}

export function buildDestinationPreferences(form: PrivateTripForm): string {
  const lines: string[] = [];

  lines.push(`[Pemesan]`);
  lines.push(`Nama: ${form.nama}`);
  if (form.phone) lines.push(`Ponsel: ${form.phone}`);
  if (form.email) lines.push(`Email: ${form.email}`);

  lines.push(`[Detail Perjalanan]`);
  lines.push(`Tipe Trip: ${form.tripType === "custom" ? "Destinasi Baru (Custom)" : "Modifikasi Paket Web"}`);
  if (form.tripType === "custom" && form.customTripName) lines.push(`Tujuan: ${form.customTripName}`);
  if (form.tripType === "explorer" && form.selectedDestinasi)
    lines.push(`Paket Referensi: ${form.selectedDestinasi.title || form.selectedDestinasi.name}`);
  lines.push(`Jumlah Peserta: ${form.jumlahPeserta || 1} orang`);
  lines.push(`Durasi: ${form.durasi || "-"} hari`);
  if (form.tanggalFleksibel) lines.push(`Tanggal Keberangkatan: Fleksibel`);
  else if (form.tanggal) lines.push(`Tanggal Keberangkatan: ${form.tanggal}`);
  if (form.meetingPoint) lines.push(`Meeting Point: ${form.meetingPoint}`);
  if (form.transportNeeds) {
    const map: Record<string, string> = {
      "all-in": "All-in dari Kota Asal",
      local: "Transportasi Lokal Saja",
      self: "Bawa Kendaraan Sendiri",
    };
    lines.push(`Transportasi: ${map[form.transportNeeds] || form.transportNeeds}`);
  }

  lines.push(`[Fasilitas & Budget]`);
  if (form.standarPenginapan) {
    const sm: Record<string, string> = {
      budget: "Budget / Homestay",
      bintang3: "Hotel Bintang 3",
      bintang4: "Hotel Bintang 4",
      bintang5: "Hotel Bintang 5",
      villa: "Villa / Resort",
    };
    lines.push(`Standar Penginapan: ${sm[form.standarPenginapan] || form.standarPenginapan}`);
  }
  if (form.layananTambahan && form.layananTambahan.length > 0) {
    const lm: Record<string, string> = {
      fotografer: "Fotografer / Video",
      drone: "Kamera Drone",
      gala: "Gala Dinner / BBQ",
      tourLeader: "Tour Leader Khusus",
    };
    lines.push(`Layanan Tambahan: ${form.layananTambahan.map((k) => lm[k] || k).join(", ")}`);
  }
  if (form.catatan) lines.push(`Catatan Khusus: ${form.catatan}`);
  if (form.budget) lines.push(`Estimasi Budget: Rp ${form.budget} /orang`);
  if (form.metodeKontak)
    lines.push(
      `Metode Tindak Lanjut: ${form.metodeKontak === "whatsapp" ? "Hubungi via WhatsApp" : "Kirim ke Email"}`,
    );

  lines.push(`[Asal Pemesanan]`);
  lines.push(`Tipe: ${form.tripFrom}`);
  if (form.tripFrom !== "Individu" && form.namaInstitusi) lines.push(`Institusi: ${form.namaInstitusi}`);

  return lines.join("\n");
}

export function buildPayload(form: PrivateTripForm, budgetValue: unknown): PrivateTripPayload {
  const title =
    form.tripType === "custom"
      ? form.customTripName.trim() || "Custom Trip"
      : form.selectedDestinasi?.name || form.selectedDestinasi?.title || "Trip Explorer";

  const participantsCount = parseInt(form.jumlahPeserta, 10);
  const durationDays = parseInt(form.durasi, 10);

  return {
    title,
    durationDays: isNaN(durationDays) || durationDays < 1 ? 1 : durationDays,
    participantsCount: isNaN(participantsCount) ? 6 : participantsCount,
    destinationPreferences: buildDestinationPreferences(form),
    specialRequirements: form.catatan?.trim() || undefined,
    budgetEstimate: budgetValue ? String(budgetValue) : undefined,
  };
}

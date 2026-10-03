export interface GroupFormState {
  startDate: string;
  endDate: string;
  maxParticipants: number;
  minParticipants: number;
  notes: string;
}

export const EMPTY_GROUP_FORM: GroupFormState = {
  startDate: "",
  endDate: "",
  maxParticipants: 10,
  minParticipants: 1,
  notes: "",
};

export function validateGroupForm(form: GroupFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.startDate) e.startDate = "Tanggal berangkat wajib diisi";
  if (!form.endDate) e.endDate = "Tanggal pulang wajib diisi";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    e.endDate = "Tanggal pulang harus setelah tanggal berangkat";
  }
  if (!form.maxParticipants || form.maxParticipants < 1) {
    e.maxParticipants = "Kuota minimal 1";
  }
  return e;
}

export function buildGroupPayload(form: GroupFormState): Record<string, unknown> {
  return {
    startDate: form.startDate,
    endDate: form.endDate,
    maxParticipants: form.maxParticipants,
    minParticipants: form.minParticipants,
    notes: form.notes || null,
  };
}

interface RawGroup {
  startDate?: string | null;
  endDate?: string | null;
  maxParticipants?: number | null;
  minParticipants?: number | null;
  notes?: string | null;
}

export function mapGroupToForm(group: RawGroup): GroupFormState {
  return {
    startDate: group.startDate?.slice(0, 10) || "",
    endDate: group.endDate?.slice(0, 10) || "",
    maxParticipants: group.maxParticipants || 10,
    minParticipants: group.minParticipants || 1,
    notes: group.notes || "",
  };
}

export interface PriceTierFormState {
  name: string;
  price: string;
  quota: string | number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export const EMPTY_PRICE_FORM: PriceTierFormState = {
  name: "",
  price: "",
  quota: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
};

export const PRICE_TIER_SUGGESTIONS = ["Dewasa", "Anak", "Early Bird", "Lansia"];

export function validatePriceForm(form: PriceTierFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.name.trim()) e.name = "Nama tier wajib diisi";
  const digits = String(form.price ?? "").replace(/\D/g, "");
  if (!digits || Number(digits) <= 0) e.price = "Harga tier harus lebih dari 0";
  const quota = Number(form.quota);
  if (form.quota === "" || !Number.isInteger(quota) || quota < 1) e.quota = "Kuota tier minimal 1";
  if (form.validFrom && form.validUntil && form.validUntil < form.validFrom) {
    e.validUntil = "Tanggal selesai harus setelah tanggal mulai";
  }
  return e;
}

export interface PrivateTripDestination {
  id: string;
  title?: string | null;
  name?: string | null;
  image?: string | null;
  location?: string | null;
  rating?: number | null;
  priceMin?: number | string | null;
  priceMax?: number | string | null;
  isSeniorFriendly?: boolean | null;
}

export interface PrivateTripForm {
  nama: string;
  phone: string;
  email: string;
  budget: string;
  tanggal: string;
  tanggalFleksibel: boolean;
  durasi: string;
  meetingPoint: string;
  catatan: string;
  tripType: string;
  customTripName: string;
  selectedDestinasi: PrivateTripDestination | null;
  tripFrom: string;
  namaInstitusi: string;
  jumlahPeserta: string;
  transportNeeds: string;
  standarPenginapan: string;
  layananTambahan: string[];
  metodeKontak: string;
}

export type FormErrors = { [key: string]: string | undefined };

export type SetFormField = (field: string, value: unknown) => void;

export interface PrivateTripPayload {
  title: string;
  durationDays: number;
  participantsCount: number;
  destinationPreferences: string;
  specialRequirements?: string;
  budgetEstimate?: string;
}

export interface PrivateTripState {
  form: PrivateTripForm;
  errors: FormErrors;
  destinations: PrivateTripDestination[];
  submitted: boolean;
  requestId: string | null;
  showTerms: boolean;
  isLoading: boolean;
  submitError: string | null;
}

export type PrivateTripAction =
  | { type: "SET_FIELD"; field: string; value: unknown }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "SET_TERMS"; open: boolean }
  | { type: "SUBMIT_STARTED" }
  | { type: "SUBMIT_SUCCEEDED"; requestId: string | null }
  | { type: "SUBMIT_FAILED"; message: string }
  | { type: "DESTINATIONS_LOADED"; destinations: PrivateTripDestination[] }
  | { type: "HYDRATE_DRAFT"; draft: Partial<PrivateTripForm> }
  | { type: "RESET_FORM" };

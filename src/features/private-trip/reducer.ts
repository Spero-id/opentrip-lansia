import { initialForm } from "./components/helpers/initialState";
import type {
  PrivateTripAction,
  PrivateTripForm,
  PrivateTripState,
} from "./types";

export const initialPrivateTripState: PrivateTripState = {
  form: { ...initialForm },
  errors: {},
  destinations: [],
  submitted: false,
  requestId: null,
  showTerms: false,
  isLoading: false,
  submitError: null,
};

export function privateTripReducer(
  state: PrivateTripState,
  action: PrivateTripAction,
): PrivateTripState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value } as PrivateTripForm,
        errors: { ...state.errors, [action.field]: undefined },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "SET_TERMS":
      return { ...state, showTerms: action.open, submitError: null };
    case "SUBMIT_STARTED":
      return { ...state, showTerms: false, isLoading: true, submitError: null };
    case "SUBMIT_SUCCEEDED":
      return { ...state, submitted: true, requestId: action.requestId, isLoading: false };
    case "SUBMIT_FAILED":
      return { ...state, submitError: action.message, isLoading: false };
    case "DESTINATIONS_LOADED":
      return { ...state, destinations: action.destinations };
    case "HYDRATE_DRAFT":
      return {
        ...state,
        form: {
          ...initialForm,
          ...action.draft,
          layananTambahan: Array.isArray(action.draft.layananTambahan)
            ? action.draft.layananTambahan
            : initialForm.layananTambahan,
        },
      };
    case "RESET_FORM":
      return {
        ...initialPrivateTripState,
        form: { ...initialForm },
        destinations: state.destinations,
      };
    default:
      return state;
  }
}

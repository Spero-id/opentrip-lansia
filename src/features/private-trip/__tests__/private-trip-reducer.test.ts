import { describe, expect, it } from "vitest";
import { initialPrivateTripState, privateTripReducer } from "@/features/private-trip/reducer";
import { initialForm } from "@/features/private-trip/components/helpers/initialState";
import type { PrivateTripState } from "@/features/private-trip/types";

function makeState(overrides: Partial<PrivateTripState> = {}): PrivateTripState {
  return {
    ...initialPrivateTripState,
    form: { ...initialForm },
    errors: {},
    ...overrides,
  };
}

describe("initial state", () => {
  it("starts with a blank form", () => {
    expect(initialPrivateTripState.submitted).toBe(false);
    expect(initialPrivateTripState.form.tripType).toBe("custom");
    expect(initialPrivateTripState.form.metodeKontak).toBe("whatsapp");
  });
});

describe("SET_FIELD", () => {
  it("sets one field and clears its error", () => {
    const next = privateTripReducer(
      makeState({ errors: { nama: "Wajib diisi" } }),
      { type: "SET_FIELD", field: "nama", value: "Budi" },
    );
    expect(next.form.nama).toBe("Budi");
    expect(next.errors.nama).toBeUndefined();
  });
  it("keeps other fields and errors", () => {
    const next = privateTripReducer(
      makeState({ errors: { phone: "Wajib diisi" } }),
      { type: "SET_FIELD", field: "nama", value: "Budi" },
    );
    expect(next.errors.phone).toBe("Wajib diisi");
  });
});

describe("SET_ERRORS", () => {
  it("replaces the error map", () => {
    const next = privateTripReducer(makeState(), {
      type: "SET_ERRORS",
      errors: { nama: "Wajib diisi" },
    });
    expect(next.errors).toEqual({ nama: "Wajib diisi" });
  });
});

describe("SET_TERMS", () => {
  it("opens terms and clears submit error", () => {
    const next = privateTripReducer(
      makeState({ submitError: "old" }),
      { type: "SET_TERMS", open: true },
    );
    expect(next.showTerms).toBe(true);
    expect(next.submitError).toBeNull();
  });
  it("closes terms", () => {
    const next = privateTripReducer(
      makeState({ showTerms: true }),
      { type: "SET_TERMS", open: false },
    );
    expect(next.showTerms).toBe(false);
  });
});

describe("submit flow", () => {
  it("SUBMIT_STARTED hides terms and locks loading", () => {
    const next = privateTripReducer(
      makeState({ showTerms: true }),
      { type: "SUBMIT_STARTED" },
    );
    expect(next.showTerms).toBe(false);
    expect(next.isLoading).toBe(true);
    expect(next.submitError).toBeNull();
  });
  it("SUBMIT_SUCCEEDED stores the request", () => {
    const next = privateTripReducer(
      makeState({ isLoading: true }),
      { type: "SUBMIT_SUCCEEDED", requestId: "r1" },
    );
    expect(next.submitted).toBe(true);
    expect(next.requestId).toBe("r1");
    expect(next.isLoading).toBe(false);
  });
  it("SUBMIT_FAILED surfaces the message", () => {
    const next = privateTripReducer(
      makeState({ isLoading: true }),
      { type: "SUBMIT_FAILED", message: "no" },
    );
    expect(next.submitError).toBe("no");
    expect(next.isLoading).toBe(false);
  });
});

describe("DESTINATIONS_LOADED", () => {
  it("stores destinations", () => {
    const next = privateTripReducer(makeState(), {
      type: "DESTINATIONS_LOADED",
      destinations: [{ id: "d1", title: "Trip" }],
    });
    expect(next.destinations).toHaveLength(1);
  });
});

describe("HYDRATE_DRAFT", () => {
  it("merges the draft over defaults", () => {
    const next = privateTripReducer(makeState(), {
      type: "HYDRATE_DRAFT",
      draft: { nama: "Budi", layananTambahan: ["drone"] },
    });
    expect(next.form.nama).toBe("Budi");
    expect(next.form.layananTambahan).toEqual(["drone"]);
    expect(next.form.tripType).toBe("custom");
  });
  it("falls back when layananTambahan is not an array", () => {
    const next = privateTripReducer(makeState(), {
      type: "HYDRATE_DRAFT",
      draft: { layananTambahan: "x" as unknown as string[] },
    });
    expect(next.form.layananTambahan).toEqual([]);
  });
});

describe("RESET_FORM", () => {
  it("restores a fresh blank form but keeps destinations", () => {
    const next = privateTripReducer(
      makeState({
        submitted: true,
        requestId: "r1",
        destinations: [{ id: "d1" }],
      }),
      { type: "RESET_FORM" },
    );
    expect(next.submitted).toBe(false);
    expect(next.requestId).toBeNull();
    expect(next.form.nama).toBe("");
    expect(next.destinations).toHaveLength(1);
  });
});

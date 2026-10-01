import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildDestinationPreferences,
  buildPayload,
  fetchDestinations,
  normalizeDestinations,
  submitPrivateTripRequest,
} from "@/features/private-trip/api/client";
import { initialForm } from "@/features/private-trip/components/helpers/initialState";

function mockFetchOnce(payload: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(payload),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeDestinations", () => {
  it("keeps published trips with defaults", () => {
    expect(
      normalizeDestinations([{ id: "d1", status: "published", title: "Trip" }]),
    ).toEqual([
      expect.objectContaining({
        id: "d1",
        title: "Trip",
        image: null,
        location: "Indonesia",
        rating: null,
      }),
    ]);
  });
  it("drops drafts and non-arrays", () => {
    expect(normalizeDestinations([{ id: "d1", status: "draft" }])).toEqual([]);
    expect(normalizeDestinations(null)).toEqual([]);
    expect(normalizeDestinations({})).toEqual([]);
  });
});

describe("fetchDestinations", () => {
  it("fetches and normalizes trips", async () => {
    const fn = mockFetchOnce([{ id: "d1", status: "published", title: "Trip" }]);
    const items = await fetchDestinations();
    expect(fn).toHaveBeenCalledWith("/api/trips");
    expect(items).toHaveLength(1);
  });
  it("returns empty on non-ok response", async () => {
    mockFetchOnce({}, false, 500);
    await expect(fetchDestinations()).resolves.toEqual([]);
  });
});

describe("submitPrivateTripRequest", () => {
  const payload = {
    title: "Trip",
    durationDays: 3,
    participantsCount: 6,
    destinationPreferences: "x",
  };
  it("posts the payload and returns the id", async () => {
    const fn = mockFetchOnce({ id: "r1" });
    await expect(submitPrivateTripRequest(payload)).resolves.toEqual({ id: "r1" });
    expect(fn).toHaveBeenCalledWith(
      "/api/private-trips",
      expect.objectContaining({ method: "POST" }),
    );
  });
  it("maps 401 to the login message", async () => {
    mockFetchOnce({}, false, 401);
    await expect(submitPrivateTripRequest(payload)).rejects.toThrow("login");
  });
  it("uses the server message when present", async () => {
    mockFetchOnce({ error: "Penuh" }, false, 400);
    await expect(submitPrivateTripRequest(payload)).rejects.toThrow("Penuh");
  });
  it("uses the first validation message", async () => {
    mockFetchOnce({ errors: [{ message: "Nama pendek" }] }, false, 400);
    await expect(submitPrivateTripRequest(payload)).rejects.toThrow("Nama pendek");
  });
  it("throws the network message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(submitPrivateTripRequest(payload)).rejects.toThrow("koneksi");
  });
});

describe("buildDestinationPreferences", () => {
  it("renders all sections", () => {
    const text = buildDestinationPreferences({
      ...initialForm,
      nama: "Budi",
      tripType: "custom",
      customTripName: "Bromo",
      jumlahPeserta: "15",
      durasi: "3",
    });
    expect(text).toMatch("[Pemesan]");
    expect(text).toMatch("Nama: Budi");
    expect(text).toMatch("[Detail Perjalanan]");
    expect(text).toMatch("Tujuan: Bromo");
    expect(text).toMatch("[Fasilitas & Budget]");
    expect(text).toMatch("[Asal Pemesanan]");
  });
  it("maps option codes to labels", () => {
    const text = buildDestinationPreferences({
      ...initialForm,
      transportNeeds: "all-in",
      standarPenginapan: "villa",
      layananTambahan: ["drone"],
    });
    expect(text).toMatch("All-in dari Kota Asal");
    expect(text).toMatch("Villa / Resort");
    expect(text).toMatch("Kamera Drone");
  });
});

describe("buildPayload", () => {
  it("builds custom payloads with fallbacks", () => {
    const payload = buildPayload({ ...initialForm, jumlahPeserta: "", durasi: "" }, "");
    expect(payload.title).toBe("Custom Trip");
    expect(payload.durationDays).toBe(1);
    expect(payload.participantsCount).toBe(6);
    expect(payload.budgetEstimate).toBeUndefined();
  });
  it("builds explorer payloads from the destination", () => {
    const payload = buildPayload(
      {
        ...initialForm,
        tripType: "explorer",
        selectedDestinasi: { id: "d1", name: "Bromo Trip" },
      },
      2500000,
    );
    expect(payload.title).toBe("Bromo Trip");
    expect(payload.budgetEstimate).toBe("2500000");
  });
});

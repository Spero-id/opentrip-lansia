import { render, screen } from "@testing-library/react";
import TripList from "@/app/trips/page";
import TripDetail from "@/app/trips/[slug]/page";

// Mock the trip service
const mockGetPublishedTrips = jest.fn();
jest.mock("@/modules/trip/trip.service", () => ({
  tripService: {
    getPublishedTrips: (...args: any[]) => mockGetPublishedTrips(...args),
    getTripBySlug: jest.fn(() => Promise.resolve(null)),
  },
}));

describe("Trip List Page", () => {
  beforeEach(() => {
    mockGetPublishedTrips.mockReset();
  });

  it("renders page header", async () => {
    mockGetPublishedTrips.mockResolvedValue([]);
    render(await TripList({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/Jelajahi Paket/)).toBeInTheDocument();
  });

  it("renders search box", async () => {
    mockGetPublishedTrips.mockResolvedValue([]);
    render(await TripList({ searchParams: Promise.resolve({}) }));
    expect(screen.getByPlaceholderText("Cari nama destinasi...")).toBeInTheDocument();
  });

  it("renders trip cards from service", async () => {
    mockGetPublishedTrips.mockResolvedValue([
      { id: "1", slug: "test-trip", title: "Test Trip", description: "A test", durationDays: 3, price: "500000", rating: "4.5", type: "Alam", image: "" },
    ]);
    render(await TripList({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("Test Trip")).toBeInTheDocument();
  });

  it("falls back to default trips when service returns empty", async () => {
    mockGetPublishedTrips.mockResolvedValue([]);
    render(await TripList({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("OpenTrip Kawah Ijen & Blue Fire")).toBeInTheDocument();
  });

  it("filters by search query", async () => {
    mockGetPublishedTrips.mockResolvedValue([
      { id: "1", slug: "bali-trip", title: "Bali Trip", description: "Bali", durationDays: 3, price: "500000", rating: "4.5", type: "Alam", image: "" },
      { id: "2", slug: "lombok-trip", title: "Lombok Trip", description: "Lombok", durationDays: 2, price: "300000", rating: "4.0", type: "Alam", image: "" },
    ]);
    render(await TripList({ searchParams: Promise.resolve({ q: "bali" }) }));
    expect(screen.getByText("Bali Trip")).toBeInTheDocument();
    expect(screen.queryByText("Lombok Trip")).not.toBeInTheDocument();
  });
});

describe("Trip Detail Page", () => {
  it("renders trip detail with fallback data", async () => {
    render(await TripDetail({ params: Promise.resolve({ slug: "test-trip" }) }));
    expect(screen.getByText(/Test Trip/i)).toBeInTheDocument();
  });

  it("shows back link", async () => {
    render(await TripDetail({ params: Promise.resolve({ slug: "test-trip" }) }));
    expect(screen.getByText("Kembali ke Semua Trip")).toBeInTheDocument();
  });

  it("renders departure schedule section", async () => {
    render(await TripDetail({ params: Promise.resolve({ slug: "test-trip" }) }));
    expect(screen.getByText(/Jadwal Keberangkatan/)).toBeInTheDocument();
  });

  it("renders book now buttons for departures", async () => {
    render(await TripDetail({ params: Promise.resolve({ slug: "test-trip" }) }));
    const buttons = screen.getAllByText("Pesan Sekarang");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("shows price information", async () => {
    render(await TripDetail({ params: Promise.resolve({ slug: "test-trip" }) }));
    expect(screen.getByText(/pax/)).toBeInTheDocument();
  });
});

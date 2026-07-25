import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminTrips from "@/app/admin/trips/page";
import AdminDestinations from "@/app/admin/destinations/page";
import AdminVendors from "@/app/admin/vendors/page";
import AdminBlogs from "@/app/admin/blogs/page";

// Mock global fetch for admin CRUD pages
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock slugify
jest.mock("@/shared/utils/helpers", () => ({
  slugify: jest.fn((s: string) => s.toLowerCase().replace(/\s+/g, "-")),
  generateCode: jest.fn(() => "OTL-TEST"),
  formatCurrency: jest.fn((a: string) => `Rp ${parseInt(a).toLocaleString("id-ID")}`),
}));

describe("Admin Trips Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders page title", () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminTrips />);
    expect(screen.getByText("Manajemen Paket Trip")).toBeInTheDocument();
  });

  it("renders add trip button", () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminTrips />);
    expect(screen.getByText("Tambah Trip Baru")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminTrips />);
    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("renders trip table with data", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        { id: "1", title: "Test Trip", type: "open_trip", durationDays: 3, status: "published" },
      ]),
      ok: true,
    });
    render(<AdminTrips />);
    const title = await screen.findByText("Test Trip");
    expect(title).toBeInTheDocument();
  });
});

describe("Admin Destinations Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders page title", () => {
    mockFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminDestinations />);
    expect(screen.getByText("Manajemen Destinasi")).toBeInTheDocument();
  });

  it("renders add destination button", () => {
    mockFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminDestinations />);
    expect(screen.getByText("Tambah Destinasi")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminDestinations />);
    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("renders destination rows", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve([
          { id: "1", name: "Test Dest", slug: "test-dest", description: null, location: "Jakarta", categoryId: null, difficultyLevel: "Mudah", isActive: true, visitEstimateMinutes: 60, accessibilityInfo: null },
        ]),
        ok: true,
      })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminDestinations />);
    const dest = await screen.findByText("Test Dest");
    expect(dest).toBeInTheDocument();
  });
});

describe("Admin Vendors Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders page title", () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
    render(<AdminVendors />);
    expect(screen.getByText("Manajemen Vendor")).toBeInTheDocument();
  });

  it("renders add vendor button", () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
    render(<AdminVendors />);
    expect(screen.getByText("Tambah Vendor")).toBeInTheDocument();
  });

  it("renders typeId label in create modal", async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
    render(<AdminVendors />);
    const addBtn = screen.getByText("Tambah Vendor");
    addBtn.click();
    expect(await screen.findByText("Tipe Vendor")).toBeInTheDocument();
  });
});

describe("Admin Blogs Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders page title", () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminBlogs />);
    expect(screen.getByText("Manajemen Blog")).toBeInTheDocument();
  });

  it("renders add blog button", () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve([]), ok: true });
    render(<AdminBlogs />);
    expect(screen.getByText("Tambah Blog")).toBeInTheDocument();
  });
});

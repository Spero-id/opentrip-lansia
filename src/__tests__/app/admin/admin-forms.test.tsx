import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLayout from "@/app/admin/layout";
import NewTripPage from "@/app/admin/trips/new/page";
import NewDestinationPage from "@/app/admin/destinations/new/page";
import DestinationForm from "@/app/admin/destinations/destination-form";
import DeleteButton from "@/app/admin/destinations/delete-button";
import TripForm from "@/app/admin/trips/trip-form";

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock("@/modules/master/master.repository", () => ({
  masterRepository: {
    getDestinationCategories: jest.fn(() => Promise.resolve([])),
  },
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders sidebar with nav items", () => {
    render(<AdminLayout><p>Content</p></AdminLayout>);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Paket Trip")).toBeInTheDocument();
    expect(screen.getByText("Destinasi")).toBeInTheDocument();
    expect(screen.getByText("HORECA")).toBeInTheDocument();
    expect(screen.getByText("Vendor")).toBeInTheDocument();
    expect(screen.getByText("Promo")).toBeInTheDocument();
    expect(screen.getByText("Komisi")).toBeInTheDocument();
    expect(screen.getByText("Ulasan")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(<AdminLayout><p>Child Content</p></AdminLayout>);
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("renders ADMIN badge", () => {
    render(<AdminLayout><p>Content</p></AdminLayout>);
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("renders back to main website link", () => {
    render(<AdminLayout><p>Content</p></AdminLayout>);
    expect(screen.getByText("Kembali ke Website Utama")).toBeInTheDocument();
  });

  it("renders search bar in topbar", () => {
    render(<AdminLayout><p>Content</p></AdminLayout>);
    expect(screen.getByPlaceholderText("Cari data admin...")).toBeInTheDocument();
  });
});

describe("NewTripPage", () => {
  it("renders trip form with title", () => {
    render(<NewTripPage />);
    expect(screen.getByText("Tambah Trip Baru")).toBeInTheDocument();
  });
});

describe("TripForm", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  it("renders form fields", () => {
    render(<TripForm />);
    expect(screen.getByText("Judul Trip")).toBeInTheDocument();
    expect(screen.getByText("Tipe")).toBeInTheDocument();
    expect(screen.getByText("Durasi (hari)")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders submit and cancel buttons", () => {
    render(<TripForm />);
    expect(screen.getByText("Simpan")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
  });
});

describe("NewDestinationPage", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
  });

  it("renders destination form with title", async () => {
    const page = await NewDestinationPage();
    render(page);
    expect(screen.getByText("Tambah Destinasi Baru")).toBeInTheDocument();
  });
});

describe("DestinationForm", () => {
  it("renders form fields", () => {
    render(<DestinationForm categories={[]} />);
    expect(screen.getByText("Nama Destinasi")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi")).toBeInTheDocument();
    expect(screen.getByText("Lokasi")).toBeInTheDocument();
    expect(screen.getByText("Tingkat Kesulitan")).toBeInTheDocument();
  });

  it("renders simpan and batal buttons", () => {
    render(<DestinationForm categories={[]} />);
    expect(screen.getByText("Simpan")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
  });
});

describe("DeleteButton", () => {
  it("renders delete button with title attribute", () => {
    render(<DeleteButton id="test-id" />);
    expect(screen.getByTitle("Hapus")).toBeInTheDocument();
  });
});

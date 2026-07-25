import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminHoreca from "@/app/admin/horeca/page";
import AdminPromotions from "@/app/admin/promotions/page";
import AdminReviews from "@/app/admin/reviews/page";
import AdminGalleries from "@/app/admin/galleries/page";
import AdminCommissions from "@/app/admin/commissions/page";
import Modal from "@/app/admin/components/modal";
import ConfirmDelete from "@/app/admin/components/confirm-delete";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Admin HORECA Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
  });

  it("renders page title", () => {
    render(<AdminHoreca />);
    expect(screen.getByText("Manajemen HORECA")).toBeInTheDocument();
  });

  it("renders add button", () => {
    render(<AdminHoreca />);
    expect(screen.getByText("Tambah HORECA")).toBeInTheDocument();
  });

  it("renders typeId label in create modal", async () => {
    render(<AdminHoreca />);
    const addBtn = screen.getByText("Tambah HORECA");
    addBtn.click();
    expect(await screen.findByText("Tipe HORECA")).toBeInTheDocument();
  });
});

describe("Admin Promotions Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
  });

  it("renders page title", () => {
    render(<AdminPromotions />);
    expect(screen.getByText("Manajemen Kode Promo")).toBeInTheDocument();
  });

  it("renders add button", () => {
    render(<AdminPromotions />);
    expect(screen.getByText("Tambah Promo")).toBeInTheDocument();
  });

  it("renders minPurchase and maxDiscount fields in modal", async () => {
    render(<AdminPromotions />);
    const addBtn = screen.getByText("Tambah Promo");
    addBtn.click();
    expect(await screen.findByText("Min. Pembelian")).toBeInTheDocument();
    expect(screen.getByText("Maks. Diskon")).toBeInTheDocument();
  });
});

describe("Admin Reviews Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
  });

  it("renders page title", () => {
    render(<AdminReviews />);
    expect(screen.getByText("Manajemen Ulasan")).toBeInTheDocument();
  });
});

describe("Admin Galleries Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
  });

  it("renders page title", () => {
    render(<AdminGalleries />);
    expect(screen.getByText("Manajemen Galeri")).toBeInTheDocument();
  });

  it("renders add button", () => {
    render(<AdminGalleries />);
    expect(screen.getByText("Tambah Galeri")).toBeInTheDocument();
  });
});

describe("Admin Commissions Page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
  });

  it("renders page title", () => {
    render(<AdminCommissions />);
    expect(screen.getByText("Manajemen Komisi Agen")).toBeInTheDocument();
  });
});

describe("Modal Component", () => {
  it("renders when open", () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={jest.fn()} title="Hidden Modal">
        <p>Hidden Content</p>
      </Modal>
    );
    expect(screen.queryByText("Hidden Modal")).not.toBeInTheDocument();
  });

  it("renders close (X) button", () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="Close Test">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByTestId("lucide-X")).toBeInTheDocument();
  });
});

describe("ConfirmDelete Component", () => {
  it("renders with default title", () => {
    render(<ConfirmDelete open={true} onClose={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.getByText("Konfirmasi Hapus")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(<ConfirmDelete open={true} onClose={jest.fn()} onConfirm={jest.fn()} title="Hapus Data?" />);
    expect(screen.getByText("Hapus Data?")).toBeInTheDocument();
  });

  it("shows confirm and cancel buttons", () => {
    render(<ConfirmDelete open={true} onClose={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.getByText("Ya, Hapus")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
  });

  it("calls onConfirm when clicking confirm", async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    render(<ConfirmDelete open={true} onClose={jest.fn()} onConfirm={onConfirm} />);
    await user.click(screen.getByText("Ya, Hapus"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

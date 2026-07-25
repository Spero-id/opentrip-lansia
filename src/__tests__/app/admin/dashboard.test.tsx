import { render, screen } from "@testing-library/react";
import AdminDashboard from "@/app/admin/page";

describe("Admin Dashboard", () => {
  it("renders dashboard title", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
  });

  it("renders KPI cards", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Total Paket Trip")).toBeInTheDocument();
    expect(screen.getByText("Pemesanan Bulan Ini")).toBeInTheDocument();
    expect(screen.getByText("Total Pendapatan")).toBeInTheDocument();
    expect(screen.getByText("Promo Aktif")).toBeInTheDocument();
  });

  it("renders KPI values", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("148")).toBeInTheDocument();
    expect(screen.getByText("Rp 128.5M")).toBeInTheDocument();
  });

  it("renders create trip button", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("+ Buat Trip Baru")).toBeInTheDocument();
  });

  it("renders recent bookings table", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Pemesanan Terbaru")).toBeInTheDocument();
    expect(screen.getByText("Kode Booking")).toBeInTheDocument();
    expect(screen.getByText("Pemesan")).toBeInTheDocument();
    expect(screen.getByText("Destinasi")).toBeInTheDocument();
  });

  it("renders quick action shortcuts", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Kelola Paket Trip")).toBeInTheDocument();
    expect(screen.getByText("Tambah Destinasi Baru")).toBeInTheDocument();
    expect(screen.getByText("Buat Kode Kupon / Promo")).toBeInTheDocument();
  });

  it("shows real booking data", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("Siti Rahmawati")).toBeInTheDocument();
    expect(screen.getByText("Aditya Pratama")).toBeInTheDocument();
  });
});

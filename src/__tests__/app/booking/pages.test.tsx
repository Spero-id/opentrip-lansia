import { render, screen } from "@testing-library/react";
import BookingPage from "@/app/booking/page";
import PaymentPage from "@/app/booking/[id]/payment/page";
import BookingSuccess from "@/app/booking/[id]/success/page";

// Mock booking service for payment page
jest.mock("@/modules/booking/booking.service", () => ({
  bookingService: {
    getBooking: jest.fn(() => Promise.resolve(null)),
  },
}));

describe("Booking Page", () => {
  it("renders booking form with demo data", async () => {
    render(await BookingPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/FORM PEMESANAN/)).toBeInTheDocument();
  });

  it("shows back link", async () => {
    render(await BookingPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("Kembali ke Destinasi")).toBeInTheDocument();
  });

  it("renders trip title", async () => {
    render(await BookingPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/Labuan Bajo/)).toBeInTheDocument();
  });
});

describe("Payment Page", () => {
  it("shows not found when booking is null", async () => {
    render(await PaymentPage({ params: Promise.resolve({ id: "test-id" }) }));
    expect(screen.getByText("Booking tidak ditemukan.")).toBeInTheDocument();
  });

  it("shows payment form with booking data", async () => {
    const { bookingService } = require("@/modules/booking/booking.service");
    bookingService.getBooking.mockResolvedValue({
      booking: {
        id: "b-1",
        bookingCode: "OTL-TEST",
        status: "pending",
        totalAmount: "3000000",
        totalParticipants: 2,
      },
      items: [
        { id: "i-1", quantity: 2, subtotal: "3000000" },
      ],
    });
    render(await PaymentPage({ params: Promise.resolve({ id: "b-1" }) }));
    expect(screen.getByText("Pembayaran")).toBeInTheDocument();
    expect(screen.getByText(/OTL-TEST/)).toBeInTheDocument();
  });
});

describe("Booking Success Page", () => {
  it("renders success message", () => {
    render(<BookingSuccess />);
    expect(screen.getByText("Pemesanan Berhasil!")).toBeInTheDocument();
  });

  it("renders link to trips", () => {
    render(<BookingSuccess />);
    expect(screen.getByText("Jelajahi Trip Lain")).toBeInTheDocument();
  });
});

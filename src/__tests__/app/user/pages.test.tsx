import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/profile/page";
import AgentDashboard from "@/app/agent/page";
import PrivateTripPage from "@/app/private-trip/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockDb = jest.requireMock("@/shared/db").db;

describe("Profile Page", () => {
  beforeEach(() => {
    mockDb.select.mockClear();
  });

  it("renders profile page with fallback user", async () => {
    const mockFrom = jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve([])),
      })),
    }));
    mockDb.select.mockReturnValue({ from: mockFrom });
    render(await ProfilePage());
    expect(screen.getByText("Pengguna OpenTrip")).toBeInTheDocument();
  });

  it("shows booking history section", async () => {
    const mockFrom = jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve([])),
      })),
    }));
    mockDb.select.mockReturnValue({ from: mockFrom });
    render(await ProfilePage());
    expect(screen.getByText("Riwayat Pemesanan Trip")).toBeInTheDocument();
  });

  it("shows user email fallback", async () => {
    const mockFrom = jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve([])),
      })),
    }));
    mockDb.select.mockReturnValue({ from: mockFrom });
    render(await ProfilePage());
    expect(screen.getByText("user@opentrip.co.id")).toBeInTheDocument();
  });
});

describe("Agent Dashboard Page", () => {
  beforeEach(() => {
    mockDb.select.mockClear();
  });

  it("renders agent dashboard title", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
          length: 0,
        })),
      })),
    });
    render(await AgentDashboard());
    expect(screen.getByText("Dashboard Agen")).toBeInTheDocument();
  });

  it("shows referral link section", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    });
    render(await AgentDashboard());
    expect(screen.getByText("Tautan Referral")).toBeInTheDocument();
  });

  it("shows stat cards", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    });
    render(await AgentDashboard());
    expect(screen.getByText("Referral")).toBeInTheDocument();
    expect(screen.getByText("Komisi Tertunda")).toBeInTheDocument();
    expect(screen.getByText("Komisi Dibayar")).toBeInTheDocument();
  });
});

describe("Private Trip Page", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ) as jest.Mock;
  });

  it("renders private trip form", () => {
    render(<PrivateTripPage />);
    expect(screen.getByText(/Rencanakan/)).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<PrivateTripPage />);
    expect(screen.getByText(/Judul Perjalanan/)).toBeInTheDocument();
    expect(screen.getByText(/Durasi/)).toBeInTheDocument();
    expect(screen.getByText(/Jumlah Peserta/)).toBeInTheDocument();
    expect(screen.getByText(/Destinasi/)).toBeInTheDocument();
    expect(screen.getByText(/Kebutuhan Khusus/)).toBeInTheDocument();
  });
});

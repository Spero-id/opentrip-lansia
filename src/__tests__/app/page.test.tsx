import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("@/modules/trip/trip.service", () => ({
  tripService: {
    getPublishedTrips: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock("lucide-react", () => {
  const icons = [
    "Search", "Calendar", "MapPin", "Star", "CheckCircle2",
    "ShieldCheck", "Headphones", "Compass", "ArrowRight",
    "ChevronLeft", "ChevronRight", "Plus", "Quote", "Send", "Smartphone",
    "Route", "Users", "Wallet",
  ];
  const map: Record<string, () => string> = {};
  for (const name of icons) map[name] = () => `${name}Icon`;
  return map;
});

describe("Home Page", () => {
  it("renders the main section", async () => {
    render(await Home());
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders search button", async () => {
    render(await Home());
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("renders search input label", async () => {
    render(await Home());
    expect(screen.getByText("Destinasi")).toBeInTheDocument();
  });

  it("renders hero badge", async () => {
    render(await Home());
    expect(screen.getByText(/Terpercaya/)).toBeInTheDocument();
  });
});

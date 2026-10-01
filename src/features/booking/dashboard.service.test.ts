vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    execute: vi.fn(),
  },
}));

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { db } from "@/lib/db";
import { dashboardService } from "./dashboard.service";

const mockedSelect = db.select as Mock;
const mockedExecute = db.execute as Mock;

function selectResult(rows: unknown[]) {
  const promise = Promise.resolve(rows) as Promise<unknown> & { where: Mock };
  promise.where = vi.fn(() => Promise.resolve(rows));
  return promise;
}

function queueSelectResults(results: unknown[][]) {
  let call = 0;
  mockedSelect.mockImplementation(() => ({
    from: vi.fn(() => selectResult(results[call++])),
  }));
}

describe("dashboardService.getStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads aggregates from drizzle select results (arrays, not .rows)", async () => {
    queueSelectResults([
      [{ count: 5 }],
      [{ count: 4 }],
      [{ total: "1500000" }],
      [{ count: 2 }],
      [{ count: 2 }],
    ]);

    const stats = await dashboardService.getStats();

    expect(stats.totalTrips).toBe(5);
    expect(stats.bookingThisMonth).toBe(4);
    expect(stats.activePromos).toBe(2);
    expect(stats.revenue).toBe("Rp 1.5Jt");
    expect(stats.bookingChange).toBe(100);
  });

  it("returns null bookingChange when last month had no bookings", async () => {
    queueSelectResults([[{ count: 1 }], [{ count: 0 }], [{ total: "0" }], [{ count: 0 }], [{ count: 0 }]]);

    const stats = await dashboardService.getStats();

    expect(stats.totalTrips).toBe(1);
    expect(stats.revenue).toBe("Rp 0");
    expect(stats.bookingChange).toBeNull();
  });

  it("tolerates empty result sets instead of throwing", async () => {
    queueSelectResults([[], [], [], [], []]);

    const stats = await dashboardService.getStats();

    expect(stats.totalTrips).toBe(0);
    expect(stats.revenue).toBe("Rp 0");
    expect(stats.bookingChange).toBeNull();
  });
});

describe("dashboardService.getRecentBookings", () => {
  it("maps rows from db.execute (which does return .rows)", async () => {
    mockedExecute.mockResolvedValue({
      rows: [
        {
          id: "b1",
          booking_code: "OTL-1",
          status: "confirmed",
          total_amount: "500000",
          currency: "IDR",
          booking_date: "2026-01-01",
          customer_name: "Budi",
          trip_name: "Bromo",
        },
      ],
    });

    const rows = await dashboardService.getRecentBookings();

    expect(rows).toEqual([
      expect.objectContaining({
        bookingCode: "OTL-1",
        customerName: "Budi",
        tripName: "Bromo",
      }),
    ]);
  });
});

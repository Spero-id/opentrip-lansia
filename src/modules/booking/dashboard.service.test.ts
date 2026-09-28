/**
 * Regression test for the admin dashboard HTTP 500.
 *
 * `dashboardService.getStats()` used `db.select(...).from(...)` (which resolves
 * to a plain array of rows) but read the result as `result.rows[0]` — a shape
 * only returned by `db.execute()`. `.rows` is `undefined` on an array, so
 * `undefined[0]` threw a TypeError that `src/app/api/admin/dashboard/route.ts`
 * turned into HTTP 500.
 */
jest.mock("@/shared/db", () => ({
  db: {
    select: jest.fn(),
    execute: jest.fn(),
  },
}));

import { db } from "@/shared/db";
import { dashboardService } from "./dashboard.service";

const mockedSelect = db.select as jest.Mock;
const mockedExecute = db.execute as jest.Mock;

/** Mimics a drizzle select query: awaiting it yields rows, `.where()` too. */
function selectResult(rows: unknown[]) {
  const promise = Promise.resolve(rows) as Promise<unknown> & {
    where: jest.Mock;
  };
  promise.where = jest.fn(() => Promise.resolve(rows));
  return promise;
}

describe("dashboardService.getStats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("reads aggregates from drizzle select results (arrays, not .rows)", async () => {
    // Call order: trips, bookings this month, revenue, active promos, bookings last month
    const results = [
      [{ count: 5 }],
      [{ count: 4 }],
      [{ total: "1500000" }],
      [{ count: 2 }],
      [{ count: 2 }],
    ];
    let call = 0;
    mockedSelect.mockImplementation(() => ({
      from: jest.fn(() => selectResult(results[call++])),
    }));

    const stats = await dashboardService.getStats();

    expect(stats.totalTrips).toBe(5);
    expect(stats.bookingThisMonth).toBe(4);
    expect(stats.activePromos).toBe(2);
    expect(stats.revenue).toBe("Rp 1.5Jt"); // toFixed(1) — titik, bukan koma
    expect(stats.bookingChange).toBe(100); // (4 - 2) / 2 * 100
  });

  it("returns null bookingChange when last month had no bookings", async () => {
    const results = [[{ count: 1 }], [{ count: 0 }], [{ total: "0" }], [{ count: 0 }], [{ count: 0 }]];
    let call = 0;
    mockedSelect.mockImplementation(() => ({
      from: jest.fn(() => selectResult(results[call++])),
    }));

    const stats = await dashboardService.getStats();

    expect(stats.totalTrips).toBe(1);
    expect(stats.revenue).toBe("Rp 0");
    expect(stats.bookingChange).toBeNull();
  });

  it("tolerates empty result sets instead of throwing", async () => {
    mockedSelect.mockImplementation(() => ({
      from: jest.fn(() => selectResult([])),
    }));

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

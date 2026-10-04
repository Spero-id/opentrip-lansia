// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/booking/booking.repository", () => ({
  bookingRepository: {
    findStalePending: vi.fn(),
    update: vi.fn(),
    findItemsByBookingId: vi.fn(),
  },
}));

vi.mock("@/features/trip/trip.repository", () => ({
  tripRepository: {
    releaseQuota: vi.fn().mockResolvedValue(true),
    findGroupById: vi.fn(),
    findPricesByDepartureId: vi.fn(),
    findPriceById: vi.fn(),
    createPrice: vi.fn((data: unknown) => Promise.resolve({ id: "p1", ...(data as object) })),
    updatePrice: vi.fn((_id: string, data: unknown) => Promise.resolve({ id: "p1", ...(data as object) })),
    deletePrice: vi.fn().mockResolvedValue(undefined),
    countParticipantsByDepartureId: vi.fn(),
    updateGroup: vi.fn((id: string, data: unknown) => Promise.resolve({ id, ...(data as object) })),
  },
}));

import { bookingRepository } from "@/features/booking/booking.repository";
import { tripRepository } from "@/features/trip/trip.repository";
import { bookingService } from "@/features/booking/booking.service";
import { tripService } from "@/features/trip/trip.service";

const mockedBookings = bookingRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;
const mockedTrips = tripRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;

beforeEach(() => {
  vi.clearAllMocks();
  mockedTrips.findGroupById.mockResolvedValue({ id: "g1", tripId: "t1", maxParticipants: 10 });
  mockedTrips.findPricesByDepartureId.mockResolvedValue([]);
});

describe("expireStalePendingBookings", () => {
  it("cancels stale bookings and releases their quotas", async () => {
    mockedBookings.findStalePending.mockResolvedValue([{ id: "b1" }, { id: "b2" }]);
    mockedBookings.findItemsByBookingId.mockResolvedValue([
      { tripPriceId: "p1", quantity: 2 },
      { tripPriceId: null, quantity: 1 },
    ]);
    const count = await bookingService.expireStalePendingBookings(24);
    expect(count).toBe(2);
    expect(mockedBookings.update).toHaveBeenCalledTimes(2);
    expect(mockedTrips.releaseQuota).toHaveBeenCalledWith("p1", 2);
    expect(mockedTrips.releaseQuota).toHaveBeenCalledTimes(2);
  });
});

describe("updateGroup quota guard", () => {
  it("refuses maxParticipants below held seats", async () => {
    mockedTrips.countParticipantsByDepartureId.mockResolvedValue(6);
    await expect(tripService.updateGroup("g1", { maxParticipants: 4 } as never)).rejects.toThrow(
      "tidak boleh lebih kecil dari 6 kursi terbooking",
    );
  });
});

describe("tier consolidation guard", () => {
  it("refuses tier quotas exceeding group max", async () => {
    mockedTrips.findPricesByDepartureId.mockResolvedValue([
      { id: "p0", name: "Dewasa", quota: 8, isActive: true },
    ]);
    await expect(
      tripService.createPrice("t1", "g1", { name: "Anak", price: "100", quota: 5 }),
    ).rejects.toThrow("melebihi kuota grup");
  });

  it("deactivating a tier touches only the tier, never bookings", async () => {
    mockedTrips.findPriceById.mockResolvedValue({ id: "p1", departureId: "g1", name: "Anak", price: "100", quota: 5, quotaBooked: 3 });
    mockedTrips.findPricesByDepartureId.mockResolvedValue([]);
    const updated = await tripService.updatePrice("t1", "g1", "p1", { isActive: false });
    expect(mockedTrips.updatePrice).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ isActive: false }),
    );
    expect(mockedBookings.update).not.toHaveBeenCalled();
    expect(updated).toMatchObject({ id: "p1" });
  });
});
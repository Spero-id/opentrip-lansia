import { PUT, DELETE } from "@/app/api/trips/[id]/route";
import { tripService } from "@/modules/trip/trip.service";

jest.mock("@/modules/trip/trip.service", () => ({
  tripService: {
    updateTrip: jest.fn(),
    deleteTrip: jest.fn(),
  },
}));

describe("PUT /api/trips/[id]", () => {
  it("updates trip and returns it", async () => {
    const updated = { id: "1", title: "Updated" };
    (tripService.updateTrip as jest.Mock).mockResolvedValue(updated);

    const req = new Request("http://localhost:3000/api/trips/1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });
    const response = await PUT(req as any, { params: Promise.resolve({ id: "1" }) });
    const data = await response.json();

    expect(data).toEqual(updated);
    expect(response.status).toBe(200);
  });

  it("returns 404 when trip not found", async () => {
    (tripService.updateTrip as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/trips/1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });
    const response = await PUT(req as any, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/trips/[id]", () => {
  it("deletes trip and returns success", async () => {
    const req = new Request("http://localhost:3000/api/trips/1", { method: "DELETE" });
    const response = await DELETE(req as any, { params: Promise.resolve({ id: "1" }) });
    const data = await response.json();

    expect(tripService.deleteTrip).toHaveBeenCalledWith("1");
    expect(data).toEqual({ message: "deleted" });
  });
});

import { NextRequest } from "next/server";
import { privateTripController } from "@/modules/private-trip/private-trip.controller";
import { privateTripService } from "@/modules/private-trip/private-trip.service";

jest.mock("@/modules/private-trip/private-trip.service", () => ({
  privateTripService: {
    submitRequest: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
    createProposal: jest.fn(),
    findProposalsByRequestId: jest.fn(),
    respondToProposal: jest.fn(),
  },
}));

// Mock auth config for testing
jest.mock("@/modules/auth/auth.config", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

import { auth } from "@/modules/auth/auth.config";

function mockSession(userId: string, role = "user") {
  (auth.api.getSession as jest.Mock).mockResolvedValue({
    user: { id: userId, role, name: "Test User", email: "test@test.com" },
    session: { id: "sess-1" },
  });
}

function mockNoSession() {
  (auth.api.getSession as jest.Mock).mockResolvedValue(null);
}

describe("privateTripController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNoSession();
  });

  describe("create", () => {
    it("returns 401 when not authenticated", async () => {
      const req = new NextRequest("http://localhost:3000/api/private-trip", {
        method: "POST",
        body: JSON.stringify({ title: "Test" }),
      });
      const response = await privateTripController.create(req);
      expect(response.status).toBe(401);
    });

    it("returns 400 for invalid input", async () => {
      mockSession("user-1");
      const req = new NextRequest("http://localhost:3000/api/private-trip", {
        method: "POST",
        body: JSON.stringify({ title: "" }),
      });
      const response = await privateTripController.create(req);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.errors).toBeDefined();
    });

    it("submits private trip request when authenticated", async () => {
      mockSession("user-1");
      const result = { id: "req-1", status: "submitted" };
      (privateTripService.submitRequest as jest.Mock).mockResolvedValue(result);

      const req = new NextRequest("http://localhost:3000/api/private-trip", {
        method: "POST",
        body: JSON.stringify({
          title: "Custom Trip",
          durationDays: 5,
          participantsCount: 4,
          destinationPreferences: "Bali",
        }),
      });

      const response = await privateTripController.create(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe("req-1");
      expect(privateTripService.submitRequest).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ title: "Custom Trip" })
      );
    });
  });

  describe("listByUser", () => {
    it("returns 401 when not authenticated", async () => {
      const req = new NextRequest("http://localhost:3000/api/private-trip");
      const response = await privateTripController.listByUser(req);
      expect(response.status).toBe(401);
    });

    it("returns user requests when authenticated", async () => {
      mockSession("user-1");
      const requests = [{ id: "req-1", userId: "user-1", title: "My Trip" }];
      (privateTripService.findByUserId as jest.Mock).mockResolvedValue(requests);

      const req = new NextRequest("http://localhost:3000/api/private-trip");
      const response = await privateTripController.listByUser(req);
      const data = await response.json();
      expect(data).toEqual(requests);
    });
  });
});

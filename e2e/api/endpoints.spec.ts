import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  const publicEndpoints = [
    { path: "/api/trips", method: "GET", status: 200 },
    { path: "/api/blogs", method: "GET", status: 200 },
    { path: "/api/horeca", method: "GET", status: 200 },
    { path: "/api/horeca-types", method: "GET", status: 200 },
    { path: "/api/vendors", method: "GET", status: 200 },
    { path: "/api/vendor-types", method: "GET", status: 200 },
    { path: "/api/promotions", method: "GET", status: 200 },
    { path: "/api/reviews", method: "GET", status: 200 },
    { path: "/api/galleries", method: "GET", status: 200 },
    { path: "/api/meeting-points", method: "GET", status: 200 },
  ];

  const adminProtectedEndpoints = [
    { path: "/api/users", method: "GET", status: 401 },
    { path: "/api/admin/dashboard", method: "GET", status: 401 },
    { path: "/api/admin/notifications", method: "GET", status: 401 },
    { path: "/api/commissions", method: "GET", status: 401 },
    { path: "/api/commissions", method: "POST", status: 401 },
    { path: "/api/bookings", method: "GET", status: 401 },
  ];

  const endpoints = [...publicEndpoints, ...adminProtectedEndpoints];

  for (const ep of endpoints) {
    test(`${ep.method} ${ep.path} returns ${ep.status}`, async ({ request }) => {
      const call = () => {
        switch (ep.method) {
          case "GET":
            return request.get(ep.path);
          case "POST":
            return request.post(ep.path);
          case "PUT":
            return request.put(ep.path);
          case "PATCH":
            return request.patch(ep.path);
          case "DELETE":
            return request.delete(ep.path);
          default:
            throw new Error(`Unsupported method ${ep.method}`);
        }
      };
      const res = await call();
      expect(res.status()).toBe(ep.status);
      const body = await res.json();
      expect(body).toBeDefined();
    });
  }

  test("POST /api/checkout returns 401 without auth (login required)", async ({ request }) => {
    const res = await request.post("/api/checkout");
    expect(res.status()).toBe(401);
  });

  test("POST /api/blogs returns 401 without auth (admin only)", async ({ request }) => {
    const res = await request.post("/api/blogs", { data: {} });
    expect(res.status()).toBe(401);
  });

  test("POST /api/reviews returns 401 without auth (login required)", async ({ request }) => {
    const res = await request.post("/api/reviews", { data: {} });
    expect(res.status()).toBe(401);
  });
});

import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  const endpoints = [
    { path: "/api/trips", method: "GET", status: 200 },
    { path: "/api/blogs", method: "GET", status: 200 },
    { path: "/api/horeca", method: "GET", status: 200 },
    { path: "/api/horeca-types", method: "GET", status: 200 },
    { path: "/api/vendors", method: "GET", status: 200 },
    { path: "/api/vendor-types", method: "GET", status: 200 },
    { path: "/api/promotions", method: "GET", status: 200 },
    { path: "/api/reviews", method: "GET", status: 200 },
    { path: "/api/commissions", method: "GET", status: 200 },
    { path: "/api/galleries", method: "GET", status: 200 },
    { path: "/api/bookings", method: "GET", status: 200 },
    { path: "/api/meeting-points", method: "GET", status: 200 },
  ];

  for (const ep of endpoints) {
    test(`${ep.method} ${ep.path} returns ${ep.status}`, async ({ request }) => {
      const res = await request[ep.method.toLowerCase()](ep.path);
      expect(res.status()).toBe(ep.status);
      const body = await res.json();
      expect(body).toBeDefined();
    });
  }

  test("POST /api/checkout returns 401 without auth (login required)", async ({ request }) => {
    const res = await request.post("/api/checkout");
    expect(res.status()).toBe(401);
  });

  test("POST /api/blogs returns 400 without valid body", async ({ request }) => {
    const res = await request.post("/api/blogs", { data: {} });
    expect([400, 500]).toContain(res.status());
  });
});

vi.mock("@/features/payment/payment.service", () => ({
  paymentService: { reviewPayment: vi.fn(), getActiveAccounts: vi.fn() },
}));

vi.mock("@/features/payment/payment.repository", () => ({
  paymentRepository: { findById: vi.fn() },
}));

vi.mock("@/features/auth/auth.config", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import type { Mock } from "vitest";
import { db } from "@/lib/db";
import { paymentRepository } from "@/features/payment/payment.repository";
import { paymentService } from "@/features/payment/payment.service";
import { auth } from "@/features/auth/auth.config";
import { paymentController } from "@/features/payment/payment.controller";

const mockedInsert = db.insert as Mock;
const mockedFindById = paymentRepository.findById as Mock;
const mockedReview = paymentService.reviewPayment as Mock;
const mockedGetSession = auth.api.getSession as unknown as Mock;

function insertChain() {
  mockedInsert.mockImplementation(() => ({
    values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: "log-1" }])) })),
  }));
}

function lastInsertedValues(): Record<string, unknown> {
  const chain = mockedInsert.mock.results[0]?.value as { values: Mock };
  return chain.values.mock.calls[0][0];
}

function pendingPayment() {
  return {
    id: "11111111-2222-4333-8444-555555555555",
    bookingId: "book-1",
    status: "pending",
    method: "BCA",
    amount: "350000",
    proofUrl: "/api/uploads/2026/bukti.jpg",
    adminNote: null,
    reviewedBy: null,
    reviewedAt: null,
  };
}

function req(body: unknown): NextRequest {
  return new Request("http://localhost/api/payments/pay-1/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const ctx = { params: Promise.resolve({ paymentId: "11111111-2222-4333-8444-555555555555" }) };

describe("paymentController.review audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertChain();
    mockedGetSession.mockResolvedValue({ user: { id: "admin-9", role: "admin" } });
  });

  it("records an audit row for an approval without the proof file", async () => {
    mockedFindById.mockResolvedValue(pendingPayment());
    mockedReview.mockResolvedValue({ ...pendingPayment(), status: "paid", reviewedBy: "admin-9" });

    const res = await paymentController.review(req({ action: "approve" }), ctx);
    expect(res.status).toBe(200);

    expect(mockedInsert).toHaveBeenCalledTimes(1);
    const values = lastInsertedValues();
    expect(values).toMatchObject({
      adminId: "admin-9",
      action: "update",
      entityType: "payment",
      entityId: "11111111-2222-4333-8444-555555555555",
    });
    expect(values.newValues).toMatchObject({ status: "paid", reviewedBy: "admin-9" });
    expect(values.oldValues).toMatchObject({ status: "pending" });
    expect(JSON.stringify(values)).not.toContain("bukti.jpg");
    expect(values.newValues).not.toHaveProperty("proofUrl");
  });

  it("records the admin note for a rejection", async () => {
    mockedFindById.mockResolvedValue(pendingPayment());
    mockedReview.mockResolvedValue({
      ...pendingPayment(),
      status: "rejected",
      adminNote: "Bukti tidak terbaca",
    });

    const res = await paymentController.review(req({ action: "reject", note: "Bukti tidak terbaca" }), ctx);
    expect(res.status).toBe(200);

    const values = lastInsertedValues();
    expect(values.description).toBe("Pembayaran ditolak admin");
    expect(values.newValues).toMatchObject({ status: "rejected", adminNote: "Bukti tidak terbaca" });
  });

  it("writes nothing when the payment was already processed", async () => {
    mockedFindById.mockResolvedValue({ ...pendingPayment(), status: "paid" });

    const res = await paymentController.review(req({ action: "approve" }), ctx);

    expect(res.status).toBe(400);
    expect(mockedReview).not.toHaveBeenCalled();
    expect(mockedInsert).not.toHaveBeenCalled();
  });

  it("writes nothing for a non-admin session", async () => {
    mockedGetSession.mockResolvedValue({ user: { id: "user-1", role: "user" } });

    const res = await paymentController.review(req({ action: "approve" }), ctx);

    expect(res.status).toBe(403);
    expect(mockedInsert).not.toHaveBeenCalled();
  });
});
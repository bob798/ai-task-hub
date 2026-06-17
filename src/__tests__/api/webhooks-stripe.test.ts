import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock stripe lib — getStripe returns an object with webhooks.constructEvent
const mockConstructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

// Mock prisma — we need to capture the callback passed to $transaction
const mockTxTransactionFindUnique = vi.fn();
const mockTxUserFindUniqueOrThrow = vi.fn();
const mockTxUserUpdate = vi.fn();
const mockTxTransactionCreate = vi.fn();

const mockTx = {
  transaction: { findUnique: mockTxTransactionFindUnique, create: mockTxTransactionCreate },
  user: { findUniqueOrThrow: mockTxUserFindUniqueOrThrow, update: mockTxUserUpdate },
};

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}));

import { POST } from "@/app/api/webhooks/stripe/route";

function makeRequest(body: string, signature?: string) {
  const headers: Record<string, string> = { "content-type": "text/plain" };
  if (signature) headers["stripe-signature"] = signature;
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers,
  });
}

const VALID_SIGNATURE = "valid-sig";

const makeCheckoutEvent = (sessionId = "cs_test_123", metadata: Record<string, string> = {}) => ({
  type: "checkout.session.completed",
  data: {
    object: {
      id: sessionId,
      metadata: { userId: "u1", amount: "10.00", bonus: "1.00", ...metadata },
    },
  },
});

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const res = await POST(makeRequest('{"type":"test"}'));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Missing signature/i);
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });
    const res = await POST(makeRequest('{"type":"test"}', "bad-sig"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/No signatures/i);
  });

  it("processes checkout.session.completed event and credits the user", async () => {
    const event = makeCheckoutEvent();
    mockConstructEvent.mockReturnValue(event);
    mockTxTransactionFindUnique.mockResolvedValue(null); // not yet processed
    mockTxUserFindUniqueOrThrow.mockResolvedValue({
      balance: { plus: (n: number) => ({ toNumber: () => 10 + n, toString: () => String(10 + n) }) },
    });
    mockTxUserUpdate.mockResolvedValue({});
    mockTxTransactionCreate.mockResolvedValue({});

    const res = await POST(makeRequest('{}', VALID_SIGNATURE));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);

    // Idempotency check was made
    expect(mockTxTransactionFindUnique).toHaveBeenCalledWith({
      where: { externalId: "cs_test_123" },
    });
    // User balance was updated
    expect(mockTxUserUpdate).toHaveBeenCalled();
    // Transaction record was created with TOPUP type and externalId
    expect(mockTxTransactionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "TOPUP",
          externalId: "cs_test_123",
          userId: "u1",
        }),
      })
    );
  });

  it("skips processing if externalId already exists (idempotency)", async () => {
    const event = makeCheckoutEvent("cs_already_done");
    mockConstructEvent.mockReturnValue(event);
    // Simulate already-processed session
    mockTxTransactionFindUnique.mockResolvedValue({ id: "existing-tx" });

    const res = await POST(makeRequest('{}', VALID_SIGNATURE));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);

    // Should bail out after finding existing record — no user update or new transaction
    expect(mockTxUserUpdate).not.toHaveBeenCalled();
    expect(mockTxTransactionCreate).not.toHaveBeenCalled();
  });
});

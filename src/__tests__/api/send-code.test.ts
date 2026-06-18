import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// send-code/route.ts uses its own in-memory rate limiter (no @/lib/rate-limit),
// and calls prisma.user.findUnique + prisma.verificationCode.deleteMany + prisma.verificationCode.create.
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    verificationCode: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { POST } from "@/app/api/auth/send-code/route";
import { prisma } from "@/lib/db";

const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockVerificationCodeCreate = vi.mocked(prisma.verificationCode.create);
const mockVerificationCodeDeleteMany = vi.mocked(prisma.verificationCode.deleteMany);

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/send-code", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/auth/send-code", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFindUnique.mockResolvedValue(null);
    mockVerificationCodeDeleteMany.mockResolvedValue({ count: 0 } as never);
    mockVerificationCodeCreate.mockResolvedValue({} as never);
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 409 if email already registered", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing-user" } as never);
    const res = await POST(makeRequest({ email: "already@example.com" }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 200 on success and creates code in DB", async () => {
    const res = await POST(makeRequest({ email: "new@example.com" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockVerificationCodeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "new@example.com",
          code: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      })
    );
  });

  it("returns 400 for malformed JSON body", async () => {
    const req = new NextRequest("http://localhost/api/auth/send-code", {
      method: "POST",
      body: "not-json",
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  // Rate-limit test: the route uses an in-memory map keyed by email.
  // Send the same email 3 times to exhaust MAX_SENDS, then the 4th call must be 429.
  it("returns 429 when rate limited", async () => {
    // Use a unique email so prior test runs don't pollute the in-memory map.
    const email = `ratelimit-${Date.now()}@example.com`;
    for (let i = 0; i < 3; i++) {
      await POST(makeRequest({ email }));
    }
    const res = await POST(makeRequest({ email }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

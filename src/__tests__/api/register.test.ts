import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
    verificationCode: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
  },
}));

import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUserCreate = vi.mocked(prisma.user.create);
const mockTransactionCreate = vi.mocked(prisma.transaction.create);
const mockVerificationCodeFindFirst = vi.mocked(prisma.verificationCode.findFirst);
const mockVerificationCodeDeleteMany = vi.mocked(prisma.verificationCode.deleteMany);
const mockBcryptHash = vi.mocked(bcrypt.hash);

function makeRequest(body: unknown, ip = "127.0.0.1") {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Restore implementations cleared by resetAllMocks
    mockBcryptHash.mockResolvedValue("hashed-password" as never);
    mockCheckRateLimit.mockReturnValue({ allowed: true, retryAfter: 0 });
    mockFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new-user-id" } as never);
    mockTransactionCreate.mockResolvedValue({} as never);
    mockVerificationCodeFindFirst.mockResolvedValue({ id: "vc1", email: "", code: "123456", expiresAt: new Date(Date.now() + 600000), createdAt: new Date() } as never);
    mockVerificationCodeDeleteMany.mockResolvedValue({ count: 1 } as never);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfter: 60 });
    const res = await POST(makeRequest({ email: "a@b.com", password: "password123", verificationCode: "123456" }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({ password: "password123" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for missing password", async () => {
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for password shorter than 8 characters", async () => {
    const res = await POST(makeRequest({ email: "a@b.com", password: "short", verificationCode: "123456" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 409 for duplicate email", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing-id" } as never);
    const res = await POST(makeRequest({ email: "existing@b.com", password: "password123", verificationCode: "123456" }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 200 on successful registration", async () => {
    const res = await POST(makeRequest({ email: "new@b.com", password: "password123", verificationCode: "123456" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.userId).toBe("new-user-id");
  });

  it("sanitizes name by stripping HTML tags", async () => {
    // The route uses /<[^>]*>/g which removes angle-bracket tags but NOT inner text.
    // "<b>Bob</b>" → strips "<b>" and "</b>" → leaves "Bob"
    const res = await POST(
      makeRequest({ name: "<b>Bob</b>", email: "bob@b.com", password: "password123", verificationCode: "123456" })
    );
    expect(res.status).toBe(200);
    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Bob",
        }),
      })
    );
  });

  it("creates a GIFT transaction for the signup bonus", async () => {
    const res = await POST(makeRequest({ email: "bonus@b.com", password: "password123", verificationCode: "123456" }));
    expect(res.status).toBe(200);
    expect(mockTransactionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "GIFT",
          userId: "new-user-id",
        }),
      })
    );
  });
});

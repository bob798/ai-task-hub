import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    transaction: {
      aggregate: vi.fn(),
    },
  },
}));

// Also mock @/generated/prisma/client used by invite-stats
vi.mock("@/generated/prisma/client", () => ({
  Prisma: {},
}));

import { GET as getInviteCode } from "@/app/api/user/invite-code/route";
import { GET as getInviteStats } from "@/app/api/user/invite-stats/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

const mockGetServerSession = vi.mocked(getServerSession);
const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockUserUpdate = vi.mocked(prisma.user.update);
const mockUserCount = vi.mocked(prisma.user.count);
const mockTransactionAggregate = vi.mocked(prisma.transaction.aggregate);

// ──────────────────────────────────────────
// invite-code tests
// ──────────────────────────────────────────
describe("GET /api/user/invite-code", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockUserFindUnique.mockResolvedValue({ inviteCode: "MYCODE123" } as never);
    mockUserUpdate.mockResolvedValue({} as never);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await getInviteCode();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns invite code for authenticated user", async () => {
    const res = await getInviteCode();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.inviteCode).toBe("MYCODE123");
  });

  it("generates and persists invite code when user has none", async () => {
    mockUserFindUnique.mockResolvedValue({ inviteCode: null } as never);
    mockUserUpdate.mockResolvedValue({ inviteCode: "GENERATED" } as never);
    const res = await getInviteCode();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.inviteCode).toBe("string");
    expect(data.inviteCode.length).toBeGreaterThan(0);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" } })
    );
  });

  it("returns 404 when user record is missing", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const res = await getInviteCode();
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

// ──────────────────────────────────────────
// invite-stats tests
// ──────────────────────────────────────────
describe("GET /api/user/invite-stats", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockUserCount.mockResolvedValue(3);
    mockTransactionAggregate.mockResolvedValue({
      _sum: { amount: { toNumber: () => 1.5 } },
    } as never);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await getInviteStats();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns count and totalRewards for authenticated user", async () => {
    const res = await getInviteStats();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.count).toBe(3);
    expect(data.totalRewards).toBe(1.5);
  });

  it("returns totalRewards of 0 when no reward transactions exist", async () => {
    mockTransactionAggregate.mockResolvedValue({
      _sum: { amount: null },
    } as never);
    const res = await getInviteStats();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalRewards).toBe(0);
  });
});

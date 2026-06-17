import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/balance", () => ({
  getBalance: vi.fn(),
}));

import { GET } from "@/app/api/user/balance/route";
import { getServerSession } from "next-auth";
import { getBalance } from "@/lib/balance";

const mockGetServerSession = vi.mocked(getServerSession);
const mockGetBalance = vi.mocked(getBalance);

describe("GET /api/user/balance", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns the balance for an authenticated user", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockGetBalance.mockResolvedValue(12.5);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.balance).toBe(12.5);
    expect(mockGetBalance).toHaveBeenCalledWith("u1");
  });
});

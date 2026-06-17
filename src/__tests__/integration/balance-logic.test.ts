import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Helpers to create Decimal-like objects that balance.ts expects
// ---------------------------------------------------------------------------
function makeDecimal(value: number) {
  return {
    toNumber: () => value,
    lessThan: (other: { toNumber(): number }) => value < other.toNumber(),
    minus: (other: { toNumber(): number }) => makeDecimal(value - other.toNumber()),
    plus: (other: { toNumber(): number }) => makeDecimal(value + other.toNumber()),
    negated: () => makeDecimal(-value),
  };
}

// ---------------------------------------------------------------------------
// Mutable state for the mock DB — reset in beforeEach
// ---------------------------------------------------------------------------
let mockUserBalance = 10.0;
let mockExistingExternalIds: string[] = [];

// ---------------------------------------------------------------------------
// vi.mock must be at module scope (hoisted), so we close over the mutable
// variables via functions that read them at call time.
// ---------------------------------------------------------------------------
vi.mock("@/lib/db", () => {
  return {
    prisma: {
      // getBalance uses prisma.user.findUnique directly (outside $transaction)
      user: {
        findUnique: vi.fn(async () => ({
          balance: makeDecimal(mockUserBalance),
        })),
        // Used by getBalance for non-existent user path — overridden per test
        findUniqueOrThrow: vi.fn(async () => ({
          balance: makeDecimal(mockUserBalance),
        })),
        update: vi.fn(async () => {}),
      },
      transaction: {
        findFirst: vi.fn(async ({ where }: { where: { externalId?: string } }) => {
          if (
            where.externalId &&
            mockExistingExternalIds.includes(where.externalId)
          ) {
            return { id: "existing-tx" };
          }
          return null;
        }),
        create: vi.fn(async () => {}),
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
        // Provide a tx object that mirrors the prisma shape
        const tx = {
          user: {
            findUniqueOrThrow: vi.fn(async () => ({
              balance: makeDecimal(mockUserBalance),
            })),
            update: vi.fn(async ({ data }: { data: { balance: { toNumber(): number } } }) => {
              mockUserBalance = data.balance.toNumber();
            }),
          },
          transaction: {
            findFirst: vi.fn(async ({ where }: { where: { externalId?: string } }) => {
              if (
                where.externalId &&
                mockExistingExternalIds.includes(where.externalId)
              ) {
                return { id: "existing-tx" };
              }
              return null;
            }),
            create: vi.fn(async () => {}),
          },
        };
        return fn(tx);
      }),
    },
  };
});

// ---------------------------------------------------------------------------
// Import after mocks are set up
// ---------------------------------------------------------------------------
import { deductBalance, addBalance, getBalance } from "@/lib/balance";

describe("balance service logic", () => {
  beforeEach(() => {
    mockUserBalance = 10.0;
    mockExistingExternalIds = [];
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  describe("deductBalance", () => {
    it("returns success and updated balance when funds are sufficient", async () => {
      const result = await deductBalance("user-1", 3.0, "test deduction");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.newBalance).toBeCloseTo(7.0);
      }
    });

    it("returns INSUFFICIENT_BALANCE when funds are too low", async () => {
      const result = await deductBalance("user-1", 15.0, "too expensive");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("INSUFFICIENT_BALANCE");
        expect(result.currentBalance).toBeCloseTo(10.0);
      }
    });

    it("allows deduction of the exact available balance", async () => {
      const result = await deductBalance("user-1", 10.0, "exact deduction");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.newBalance).toBeCloseTo(0.0);
      }
    });

    it("rejects deduction of 0.01 more than available balance", async () => {
      const result = await deductBalance("user-1", 10.01, "just over");

      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe("addBalance", () => {
    it("increases balance and returns new balance", async () => {
      const result = await addBalance("user-1", 5.0, "top-up");
      expect(result.newBalance).toBeCloseTo(15.0);
    });

    it("skips duplicate if externalId already exists (idempotency)", async () => {
      mockExistingExternalIds = ["pay-abc-123"];

      // When the externalId already exists the function should return the
      // current balance without applying another credit.
      const result = await addBalance("user-1", 50.0, "duplicate top-up", {
        externalId: "pay-abc-123",
        type: "TOPUP",
      });

      // Balance should stay at 10 (no second credit applied)
      expect(result.newBalance).toBeCloseTo(10.0);
    });

    it("processes top-up when externalId is new", async () => {
      const result = await addBalance("user-1", 20.0, "new payment", {
        externalId: "pay-new-456",
        type: "TOPUP",
      });

      expect(result.newBalance).toBeCloseTo(30.0);
    });
  });

  // -------------------------------------------------------------------------
  describe("getBalance", () => {
    it("returns the user's current balance", async () => {
      const balance = await getBalance("user-1");
      expect(balance).toBeCloseTo(10.0);
    });

    it("returns 0 for a non-existent user", async () => {
      // Override findUnique to return null for this test
      const { prisma } = await import("@/lib/db");
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const balance = await getBalance("non-existent-user");
      expect(balance).toBe(0);
    });
  });
});

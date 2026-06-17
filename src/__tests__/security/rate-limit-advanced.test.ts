import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

// Each test uses unique user/action combos to avoid cross-test state pollution,
// because rate-limit state lives in a module-level Map.

describe("rate limit — advanced scenarios", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("concurrent requests from same user all count toward the limit", () => {
    const userId = "adv-user-concurrent";
    const action = "generate";

    // Simulate 10 "concurrent" requests (synchronous in fake-timer world)
    const results = Array.from({ length: 10 }, () =>
      checkRateLimit(userId, action)
    );

    expect(results.every((r) => r.allowed)).toBe(true);

    // The 11th should now be blocked
    const blocked = checkRateLimit(userId, action);
    expect(blocked.allowed).toBe(false);
  });

  it("different actions have independent counters", () => {
    const userId = "adv-user-actions";

    // Exhaust limit for action-a
    for (let i = 0; i < 10; i++) {
      checkRateLimit(userId, "action-a");
    }
    expect(checkRateLimit(userId, "action-a").allowed).toBe(false);

    // action-b counter is untouched — first call should be allowed
    expect(checkRateLimit(userId, "action-b").allowed).toBe(true);
  });

  it("rate limit state does not leak between users", () => {
    const action = "shared-action";

    // Exhaust limit for userX
    for (let i = 0; i < 10; i++) {
      checkRateLimit("adv-userX", action);
    }
    expect(checkRateLimit("adv-userX", action).allowed).toBe(false);

    // userY is unaffected
    expect(checkRateLimit("adv-userY", action).allowed).toBe(true);
  });

  it("after exactly 10 requests the 11th is blocked", () => {
    const userId = "adv-user-11th";
    const action = "exact-11";

    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit(userId, action);
      expect(r.allowed).toBe(true);
    }

    const eleventh = checkRateLimit(userId, action);
    expect(eleventh.allowed).toBe(false);
    expect(eleventh.retryAfter).toBeGreaterThan(0);
  });

  it("retryAfter decreases as time passes", () => {
    const userId = "adv-user-retry";
    const action = "retry-after";

    for (let i = 0; i < 10; i++) {
      checkRateLimit(userId, action);
    }

    const first = checkRateLimit(userId, action);
    expect(first.allowed).toBe(false);
    const retryAfterFirst = first.retryAfter;

    // Advance 10 seconds
    vi.advanceTimersByTime(10_000);

    const second = checkRateLimit(userId, action);
    expect(second.allowed).toBe(false);
    expect(second.retryAfter).toBeLessThan(retryAfterFirst);
  });

  it("is still blocked at 59 seconds but allowed at 61 seconds", () => {
    const userId = "adv-user-window";
    const action = "window-reset";

    for (let i = 0; i < 10; i++) {
      checkRateLimit(userId, action);
    }

    // 59 seconds in — window has NOT reset yet
    vi.advanceTimersByTime(59_000);
    expect(checkRateLimit(userId, action).allowed).toBe(false);

    // 2 more seconds (total 61s) — window has reset
    vi.advanceTimersByTime(2_000);
    expect(checkRateLimit(userId, action).allowed).toBe(true);
  });
});

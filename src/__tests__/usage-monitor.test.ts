import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Re-import the module fresh for each test so module-level state resets.
// We use vi.resetModules() in beforeEach and dynamic import inside each test.

describe("trackUsage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accumulates costs across multiple calls on the same day", async () => {
    const { trackUsage } = await import("@/lib/usage-monitor");
    trackUsage(10);
    const result = trackUsage(5);
    expect(result.total).toBeCloseTo(15);
  });

  it("returns alert:false when daily total is under the limit", async () => {
    const { trackUsage } = await import("@/lib/usage-monitor");
    const result = trackUsage(1);
    expect(result.alert).toBe(false);
  });

  it("returns alert:true when daily total exceeds the limit", async () => {
    const { trackUsage } = await import("@/lib/usage-monitor");
    // Default DAILY_COST_LIMIT is 100; push just over it.
    trackUsage(99);
    const result = trackUsage(2); // total = 101 > 100
    expect(result.alert).toBe(true);
  });

  it("resets the daily total on a new day", async () => {
    const { trackUsage } = await import("@/lib/usage-monitor");
    trackUsage(50);
    expect(trackUsage(0).total).toBeCloseTo(50);

    // Advance past midnight into the next day (25 hours)
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);

    const result = trackUsage(5);
    // After reset the total should only reflect the new call
    expect(result.total).toBeCloseTo(5);
  });
});

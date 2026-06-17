import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Reset the internal rate map by advancing time past window
    vi.useFakeTimers();
  });

  it("allows first request", () => {
    const result = checkRateLimit("user1", "test-action");
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBe(0);
  });

  it("allows up to 10 requests in a window", () => {
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit("user2", "test-action-2");
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the 11th request", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user3", "test-action-3");
    }
    const result = checkRateLimit("user3", "test-action-3");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user4", "test-action-4");
    }
    expect(checkRateLimit("user4", "test-action-4").allowed).toBe(false);

    // Advance past the 60s window
    vi.advanceTimersByTime(61_000);

    expect(checkRateLimit("user4", "test-action-4").allowed).toBe(true);
  });

  it("tracks different actions separately", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user5", "action-a");
    }
    expect(checkRateLimit("user5", "action-a").allowed).toBe(false);
    expect(checkRateLimit("user5", "action-b").allowed).toBe(true);
  });

  it("tracks different users separately", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user6", "same-action");
    }
    expect(checkRateLimit("user6", "same-action").allowed).toBe(false);
    expect(checkRateLimit("user7", "same-action").allowed).toBe(true);
  });
});

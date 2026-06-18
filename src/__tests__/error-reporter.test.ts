import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reportError } from "@/lib/error-reporter";

describe("reportError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs an Error object with its message and stack", () => {
    const err = new Error("something broke");
    reportError(err);

    expect(console.error).toHaveBeenCalledOnce();
    const logged = JSON.parse((console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(logged.message).toBe("something broke");
    expect(logged.stack).toContain("something broke");
    expect(logged.level).toBe("error");
  });

  it("logs a string error", () => {
    reportError("plain string error");

    expect(console.error).toHaveBeenCalledOnce();
    const logged = JSON.parse((console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(logged.message).toBe("plain string error");
    expect(logged.stack).toBeUndefined();
  });

  it("includes userId and action context fields", () => {
    reportError(new Error("ctx test"), { userId: "user-42", action: "upload" });

    expect(console.error).toHaveBeenCalledOnce();
    const logged = JSON.parse((console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(logged.userId).toBe("user-42");
    expect(logged.action).toBe("upload");
  });
});

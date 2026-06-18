import { describe, it, expect } from "vitest";
import { sanitizeName } from "@/lib/sanitize";

describe("sanitizeName", () => {
  it("strips HTML tags from input", () => {
    expect(sanitizeName("<b>Alice</b>")).toBe("Alice");
  });

  it("preserves plain text as-is", () => {
    expect(sanitizeName("Bob Smith")).toBe("Bob Smith");
  });

  it("returns null for empty string", () => {
    expect(sanitizeName("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(sanitizeName("   ")).toBeNull();
  });

  it("truncates at default maxLength of 50", () => {
    const long = "a".repeat(60);
    const result = sanitizeName(long);
    expect(result).toHaveLength(50);
  });

  it("truncates at custom maxLength param", () => {
    const result = sanitizeName("Hello World", 5);
    expect(result).toBe("Hello");
  });

  it("handles nested HTML tags", () => {
    expect(sanitizeName("<div><span>Charlie</span></div>")).toBe("Charlie");
  });
});

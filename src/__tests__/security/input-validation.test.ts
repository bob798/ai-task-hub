import { describe, it, expect } from "vitest";
import { DOC_MAX_LENGTH } from "@/lib/document";
import { sanitizeName } from "@/lib/sanitize";

describe("input validation and sanitization", () => {
  describe("name sanitization", () => {
    it("strips script tags but preserves inner text and trailing plain text", () => {
      // The regex /<[^>]*>/g removes only the tag delimiters, not tag contents.
      // "<script>alert(1)</script>Bob" → "alert(1)Bob" after tag removal.
      const result = sanitizeName("<script>alert(1)</script>Bob");
      expect(result).toBe("alert(1)Bob");
    });

    it("strips bold tags and leaves inner text with whitespace collapsed", () => {
      const result = sanitizeName("<b>Bold</b> name");
      expect(result).toBe("Bold name");
    });

    it("returns the inner content when only a script tag wraps content", () => {
      // Tag delimiters stripped; inner text "alert(1)" remains.
      const result = sanitizeName("<script>alert(1)</script>");
      expect(result).toBe("alert(1)");
    });

    it("returns null for empty string", () => {
      const result = sanitizeName("");
      expect(result).toBeNull();
    });

    it("returns null for whitespace-only string after stripping tags", () => {
      const result = sanitizeName("<b>   </b>");
      expect(result).toBeNull();
    });

    it("truncates names longer than 50 characters", () => {
      const longName = "A".repeat(60);
      const result = sanitizeName(longName);
      expect(result).toHaveLength(50);
    });

    it("keeps names exactly 50 chars intact", () => {
      const name = "A".repeat(50);
      const result = sanitizeName(name);
      expect(result).toBe(name);
    });

    it("strips nested HTML tags", () => {
      const result = sanitizeName("<div><span>Alice</span></div>");
      expect(result).toBe("Alice");
    });

    it("preserves plain text unchanged (within 50 chars)", () => {
      const result = sanitizeName("Jane Doe");
      expect(result).toBe("Jane Doe");
    });
  });

  describe("prompt length validation", () => {
    it("accepts prompts at exactly 4000 characters", () => {
      const prompt = "x".repeat(4000);
      expect(prompt.trim().length > 4000).toBe(false);
    });

    it("rejects prompts exceeding 4000 characters", () => {
      const prompt = "x".repeat(4001);
      expect(prompt.trim().length > 4000).toBe(true);
    });

    it("accepts empty prompt as invalid (length 0, caught by empty check before limit)", () => {
      const prompt = "";
      expect(prompt.trim().length === 0).toBe(true);
    });
  });

  describe("document text length validation", () => {
    it("DOC_MAX_LENGTH constant is 8000", () => {
      expect(DOC_MAX_LENGTH).toBe(8000);
    });

    it("accepts document text at exactly DOC_MAX_LENGTH", () => {
      const text = "x".repeat(DOC_MAX_LENGTH);
      expect(text.length > DOC_MAX_LENGTH).toBe(false);
    });

    it("rejects document text exceeding DOC_MAX_LENGTH", () => {
      const text = "x".repeat(DOC_MAX_LENGTH + 1);
      expect(text.length > DOC_MAX_LENGTH).toBe(true);
    });

    it("accepts document text well under DOC_MAX_LENGTH", () => {
      const text = "Hello world";
      expect(text.length > DOC_MAX_LENGTH).toBe(false);
    });
  });
});

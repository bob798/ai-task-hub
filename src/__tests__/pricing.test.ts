import { describe, it, expect } from "vitest";
import {
  getPricePerImage,
  calculateTotalCost,
  CODE_PRICE,
  DOC_PRICE,
  PRICE_TABLE,
} from "@/lib/pricing";

describe("pricing", () => {
  describe("getPricePerImage", () => {
    it("returns standard square price", () => {
      expect(getPricePerImage("standard", "1024x1024")).toBe(0.5);
    });

    it("returns standard other price for non-square sizes", () => {
      expect(getPricePerImage("standard", "1024x1792")).toBe(0.7);
      expect(getPricePerImage("standard", "1792x1024")).toBe(0.7);
    });

    it("returns hd square price", () => {
      expect(getPricePerImage("hd", "1024x1024")).toBe(1.0);
    });

    it("returns hd other price for non-square sizes", () => {
      expect(getPricePerImage("hd", "1024x1792")).toBe(1.5);
      expect(getPricePerImage("hd", "1792x1024")).toBe(1.5);
    });
  });

  describe("calculateTotalCost", () => {
    it("multiplies price by count", () => {
      expect(calculateTotalCost("standard", "1024x1024", 1)).toBe(0.5);
      expect(calculateTotalCost("standard", "1024x1024", 3)).toBe(1.5);
      expect(calculateTotalCost("hd", "1024x1024", 2)).toBe(2.0);
      expect(calculateTotalCost("hd", "1792x1024", 4)).toBe(6.0);
    });
  });

  describe("constants", () => {
    it("has positive code price", () => {
      expect(CODE_PRICE).toBeGreaterThan(0);
    });

    it("has positive doc price", () => {
      expect(DOC_PRICE).toBeGreaterThan(0);
    });

    it("hd prices are higher than standard", () => {
      expect(PRICE_TABLE.hd.square).toBeGreaterThan(PRICE_TABLE.standard.square);
      expect(PRICE_TABLE.hd.other).toBeGreaterThan(PRICE_TABLE.standard.other);
    });
  });
});

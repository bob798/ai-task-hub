import { describe, it, expect } from "vitest";
import {
  PRICE_TABLE,
  calculateTotalCost,
  CODE_PRICE,
  DOC_PRICE,
  type ImageQuality,
} from "@/lib/pricing";

// Estimated raw API costs in CNY used for margin assertions
const ESTIMATED_API_COST = {
  standardSquare: 0.29,
  hdSquare: 0.58,
} as const;

const MIN_MARGIN_RATIO = 1.3; // at least 30% above API cost

describe("pricing integrity", () => {
  describe("PRICE_TABLE values", () => {
    const qualities: ImageQuality[] = ["standard", "hd"];
    const categories = ["square", "other"] as const;

    it("all values are positive numbers", () => {
      for (const quality of qualities) {
        for (const category of categories) {
          const price = PRICE_TABLE[quality][category];
          expect(typeof price).toBe("number");
          expect(price).toBeGreaterThan(0);
        }
      }
    });

    it("all values have at most 2 decimal places", () => {
      for (const quality of qualities) {
        for (const category of categories) {
          const price = PRICE_TABLE[quality][category];
          const decimals = (price.toString().split(".")[1] ?? "").length;
          expect(decimals).toBeLessThanOrEqual(2);
        }
      }
    });

    it("HD prices are always >= standard prices for the same size category", () => {
      for (const category of categories) {
        expect(PRICE_TABLE.hd[category]).toBeGreaterThanOrEqual(
          PRICE_TABLE.standard[category]
        );
      }
    });
  });

  describe("calculateTotalCost", () => {
    it("returns 0 when count is 0", () => {
      expect(calculateTotalCost("standard", "1024x1024", 0)).toBe(0);
      expect(calculateTotalCost("hd", "1792x1024", 0)).toBe(0);
    });

    it("does not overflow with a large count (100)", () => {
      const result = calculateTotalCost("hd", "1024x1792", 100);
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });

    it("scales linearly with count", () => {
      const single = calculateTotalCost("standard", "1024x1024", 1);
      expect(calculateTotalCost("standard", "1024x1024", 5)).toBe(single * 5);
    });
  });

  describe("CODE_PRICE and DOC_PRICE", () => {
    it("CODE_PRICE is a positive number", () => {
      expect(typeof CODE_PRICE).toBe("number");
      expect(CODE_PRICE).toBeGreaterThan(0);
    });

    it("DOC_PRICE is a positive number", () => {
      expect(typeof DOC_PRICE).toBe("number");
      expect(DOC_PRICE).toBeGreaterThan(0);
    });
  });

  describe("price margin above estimated API cost", () => {
    it("standard square price maintains at least 30% margin over API cost", () => {
      const minPrice = ESTIMATED_API_COST.standardSquare * MIN_MARGIN_RATIO;
      // minPrice ≈ 0.377 — our price is 0.50
      expect(PRICE_TABLE.standard.square).toBeGreaterThanOrEqual(minPrice);
    });

    it("HD square price maintains at least 30% margin over API cost", () => {
      const minPrice = ESTIMATED_API_COST.hdSquare * MIN_MARGIN_RATIO;
      // minPrice ≈ 0.754 — our price is 1.00
      expect(PRICE_TABLE.hd.square).toBeGreaterThanOrEqual(minPrice);
    });
  });
});

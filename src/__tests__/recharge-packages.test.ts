import { describe, it, expect } from "vitest";
import { RECHARGE_PACKAGES, getPackageById } from "@/lib/recharge-packages";

describe("recharge-packages", () => {
  it("has 4 packages", () => {
    expect(RECHARGE_PACKAGES).toHaveLength(4);
  });

  it("packages have increasing amounts", () => {
    for (let i = 1; i < RECHARGE_PACKAGES.length; i++) {
      expect(RECHARGE_PACKAGES[i].amount).toBeGreaterThan(RECHARGE_PACKAGES[i - 1].amount);
    }
  });

  it("bonus increases with amount", () => {
    const withBonus = RECHARGE_PACKAGES.filter((p) => p.bonus > 0);
    for (let i = 1; i < withBonus.length; i++) {
      expect(withBonus[i].bonus).toBeGreaterThan(withBonus[i - 1].bonus);
    }
  });

  it("getPackageById returns correct package", () => {
    const pkg = getPackageById("pkg_50");
    expect(pkg).toBeDefined();
    expect(pkg!.amount).toBe(50);
    expect(pkg!.bonus).toBe(5);
  });

  it("getPackageById returns undefined for invalid id", () => {
    expect(getPackageById("pkg_999")).toBeUndefined();
    expect(getPackageById("")).toBeUndefined();
  });

  it("all packages have unique ids", () => {
    const ids = RECHARGE_PACKAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

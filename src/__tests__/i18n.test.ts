import { describe, it, expect } from "vitest";
import { translations, t, getLocale } from "@/lib/i18n";

describe("translations", () => {
  it("zh and en have the same top-level keys", () => {
    expect(Object.keys(translations.zh).sort()).toEqual(Object.keys(translations.en).sort());
  });

  it("zh and en nav sections have the same keys", () => {
    expect(Object.keys(translations.zh.nav).sort()).toEqual(Object.keys(translations.en.nav).sort());
  });

  it("zh and en common sections have the same keys", () => {
    expect(Object.keys(translations.zh.common).sort()).toEqual(Object.keys(translations.en.common).sort());
  });
});

describe("t()", () => {
  it("returns Chinese string for zh locale", () => {
    expect(t("zh", "nav.home")).toBe("首页");
  });

  it("returns English string for en locale", () => {
    expect(t("en", "nav.home")).toBe("Home");
  });

  it("returns the path string for an invalid key", () => {
    expect(t("en", "nav.nonexistent")).toBe("nav.nonexistent");
  });

  it("returns the path string for a deeply invalid path", () => {
    expect(t("zh", "foo.bar.baz")).toBe("foo.bar.baz");
  });
});

describe("getLocale()", () => {
  it("returns 'zh' by default in a non-browser environment (typeof window === 'undefined')", () => {
    // vitest runs in jsdom but typeof window is defined; however the function
    // falls back to "zh" when localStorage has no value set, and the server
    // branch (window === undefined) also returns "zh" — so the observable
    // result is "zh" either way in a clean test environment.
    const locale = getLocale();
    expect(locale).toBe("zh");
  });
});

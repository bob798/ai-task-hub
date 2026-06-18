import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/lib/i18n", () => ({
  getLocale: () => "zh",
  setLocale: vi.fn(),
  t: (locale: string, key: string) => key,
}));

import LocaleSwitcher from "@/components/LocaleSwitcher";

describe("LocaleSwitcher", () => {
  it("renders with locale text when locale is zh", () => {
    render(<LocaleSwitcher locale="zh" />);
    // When locale is zh, displays "EN" to switch to English
    const btn = screen.getAllByRole("button")[0];
    expect(btn).toBeInTheDocument();
    expect(screen.getAllByText("EN").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with locale text when locale is en", () => {
    render(<LocaleSwitcher locale="en" />);
    // When locale is en, displays "中" to switch to Chinese
    expect(screen.getAllByText("中").length).toBeGreaterThanOrEqual(1);
  });

  it("button is clickable", async () => {
    const { setLocale } = await import("@/lib/i18n");
    render(<LocaleSwitcher locale="zh" />);
    const btn = screen.getAllByRole("button")[0];
    fireEvent.click(btn);
    expect(setLocale).toHaveBeenCalled();
  });
});

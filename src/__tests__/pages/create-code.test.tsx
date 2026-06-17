import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "u1", name: "Test" } }, status: "authenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/create/code",
  useSearchParams: () => new URLSearchParams(),
}));

import CodePage from "@/app/create/code/page";
import { CODE_PRICE } from "@/lib/pricing";
import { LANGUAGES } from "@/lib/code";

describe("CodePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page title 代码创作", () => {
    render(<CodePage />);
    expect(screen.getAllByText("代码创作").length).toBeGreaterThanOrEqual(1);
  });

  it("renders language selection pills", () => {
    render(<CodePage />);
    for (const lang of LANGUAGES) {
      expect(screen.getAllByRole("button", { name: lang }).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders textarea for prompt", () => {
    render(<CodePage />);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(1);
  });

  it("create button is disabled when prompt is empty", () => {
    render(<CodePage />);
    const btn = screen.getAllByRole("button", { name: /开始创作/ })[0];
    expect(btn).toBeDisabled();
  });

  it("create button is enabled when prompt has text", async () => {
    const user = userEvent.setup();
    render(<CodePage />);
    await user.type(screen.getAllByRole("textbox")[0], "write a hello world");
    const btn = screen.getAllByRole("button", { name: /开始创作/ })[0];
    expect(btn).not.toBeDisabled();
  });

  it("shows cost preview with CODE_PRICE", () => {
    render(<CodePage />);
    expect(screen.getAllByText(/预计费用/).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(`¥${CODE_PRICE.toFixed(2)}`).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("clicking a language pill changes selection", async () => {
    const user = userEvent.setup();
    render(<CodePage />);
    // TypeScript is default; click Python
    const pythonBtn = screen.getAllByRole("button", { name: "Python" })[0];
    await user.click(pythonBtn);
    // After clicking, Python button should have the active indigo classes
    expect(pythonBtn.className).toMatch(/indigo/);
  });

  it("calls /api/code on submit", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ code: "console.log('hi')", cost: 0.2 }), { status: 200 })
      )
    );

    render(<CodePage />);
    await user.type(screen.getAllByRole("textbox")[0], "write hello world");
    await user.click(screen.getAllByRole("button", { name: /开始创作/ })[0]);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/code",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows 402 error with recharge link", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: "余额不足，请先充值" }), { status: 402 })
      )
    );

    render(<CodePage />);
    await user.type(screen.getAllByRole("textbox")[0], "write code");
    await user.click(screen.getAllByRole("button", { name: /开始创作/ })[0]);

    expect(await screen.findByText(/余额不足/)).toBeInTheDocument();
    expect(screen.getAllByText("去充值").length).toBeGreaterThanOrEqual(1);
  });
});

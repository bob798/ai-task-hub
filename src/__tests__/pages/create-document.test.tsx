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
  usePathname: () => "/create/document",
  useSearchParams: () => new URLSearchParams(),
}));

import DocumentPage from "@/app/create/document/page";
import { DOC_PRICE } from "@/lib/pricing";
import { DOC_MAX_LENGTH, DOC_MODES } from "@/lib/document";

describe("DocumentPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page title 智能文档", () => {
    render(<DocumentPage />);
    expect(screen.getAllByText("智能文档").length).toBeGreaterThanOrEqual(1);
  });

  it("renders mode selection pills", () => {
    render(<DocumentPage />);
    for (const m of DOC_MODES) {
      expect(screen.getAllByRole("button", { name: m.label }).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders textarea", () => {
    render(<DocumentPage />);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(1);
  });

  it("shows character count with DOC_MAX_LENGTH limit", () => {
    render(<DocumentPage />);
    // Initial count is 0 / DOC_MAX_LENGTH
    expect(screen.getAllByText(`0 / ${DOC_MAX_LENGTH}`).length).toBeGreaterThanOrEqual(1);
  });

  it("process button exists", () => {
    render(<DocumentPage />);
    expect(screen.getAllByRole("button", { name: /开始处理/ }).length).toBeGreaterThanOrEqual(1);
  });

  it("shows cost preview with DOC_PRICE", () => {
    render(<DocumentPage />);
    expect(screen.getAllByText(/预计费用/).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(`¥${DOC_PRICE.toFixed(2)}`).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("calls /api/document on submit", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ result: "This is a summary.", cost: 0.3 }), { status: 200 })
      )
    );

    render(<DocumentPage />);
    await user.type(screen.getAllByRole("textbox")[0], "some text to summarize");
    await user.click(screen.getAllByRole("button", { name: /开始处理/ })[0]);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/document",
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

    render(<DocumentPage />);
    await user.type(screen.getAllByRole("textbox")[0], "some document text");
    await user.click(screen.getAllByRole("button", { name: /开始处理/ })[0]);

    expect(await screen.findByText(/余额不足/)).toBeInTheDocument();
    expect(screen.getAllByText("去充值").length).toBeGreaterThanOrEqual(1);
  });
});

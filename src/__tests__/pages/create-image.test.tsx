import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "u1", name: "Test" } }, status: "authenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/create/image",
}));

import CreateImagePage from "@/app/create/image/page";

describe("CreateImagePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page title", () => {
    render(<CreateImagePage />);
    expect(screen.getByText("图片创作")).toBeInTheDocument();
  });

  it("renders textarea for prompt", () => {
    render(<CreateImagePage />);
    expect(screen.getAllByRole("textbox")[0]).toBeInTheDocument();
  });

  it("renders quality buttons (标准 and 高清)", () => {
    render(<CreateImagePage />);
    expect(screen.getAllByRole("button", { name: "标准" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "高清" })[0]).toBeInTheDocument();
  });

  it("renders size selector", () => {
    render(<CreateImagePage />);
    expect(screen.getAllByRole("combobox")[0]).toBeInTheDocument();
  });

  it("renders count +/- buttons", () => {
    render(<CreateImagePage />);
    const buttons = screen.getAllByRole("button");
    const minusBtn = buttons.find((b) => b.textContent === "−");
    const plusBtn = buttons.find((b) => b.textContent === "＋");
    expect(minusBtn).toBeInTheDocument();
    expect(plusBtn).toBeInTheDocument();
  });

  it("create button is disabled when prompt is empty", () => {
    render(<CreateImagePage />);
    const createBtn = screen.getAllByRole("button", { name: /开始创作/ })[0];
    expect(createBtn).toBeDisabled();
  });

  it("create button is enabled when prompt has text", async () => {
    const user = userEvent.setup();
    render(<CreateImagePage />);

    await user.type(screen.getAllByRole("textbox")[0], "a beautiful sunset");
    const createBtn = screen.getAllByRole("button", { name: /开始创作/ })[0];
    expect(createBtn).not.toBeDisabled();
  });

  it("shows cost preview", () => {
    render(<CreateImagePage />);
    expect(screen.getAllByText(/预计费用/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/¥0\.50/)[0]).toBeInTheDocument();
  });

  it("updates cost when quality changes to HD", async () => {
    const user = userEvent.setup();
    render(<CreateImagePage />);

    await user.click(screen.getAllByRole("button", { name: "高清" })[0]);
    expect(screen.getAllByText(/¥1\.00/)[0]).toBeInTheDocument();
  });

  it("calls /api/generate on submit", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        images: [{ url: "https://example.com/img.png" }],
        cost: 0.5,
        mock: true,
      }), { status: 200 })
    );

    render(<CreateImagePage />);

    await user.type(screen.getAllByRole("textbox")[0], "a cat");
    await user.click(screen.getAllByRole("button", { name: /开始创作/ })[0]);

    expect(fetchSpy).toHaveBeenCalledWith("/api/generate", expect.objectContaining({
      method: "POST",
    }));
  });

  it("shows 402 error with recharge link", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "余额不足", code: "INSUFFICIENT_BALANCE" }), { status: 402 })
    );

    render(<CreateImagePage />);
    await user.type(screen.getAllByRole("textbox")[0], "test");
    await user.click(screen.getAllByRole("button", { name: /开始创作/ })[0]);

    expect(await screen.findByText(/余额不足/)).toBeInTheDocument();
    expect(screen.getAllByText("去充值")[0]).toBeInTheDocument();
  });

  it("increments and decrements count", async () => {
    const user = userEvent.setup();
    render(<CreateImagePage />);

    const buttons = screen.getAllByRole("button");
    const plusBtn = buttons.find((b) => b.textContent === "＋")!;
    const minusBtn = buttons.find((b) => b.textContent === "−")!;

    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    await user.click(plusBtn);
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
    await user.click(minusBtn);
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/register",
}));

import RegisterPage from "@/app/register/page";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders register form with all fields", () => {
    render(<RegisterPage />);
    expect(screen.getAllByPlaceholderText("你的昵称")[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("your@email.com")[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("至少 8 个字符")[0]).toBeInTheDocument();
  });

  it("renders create account button", () => {
    render(<RegisterPage />);
    expect(screen.getAllByRole("button", { name: "创建账户" }).length).toBeGreaterThanOrEqual(1);
  });

  it("renders login link", () => {
    render(<RegisterPage />);
    expect(screen.getAllByText("立即登录").length).toBeGreaterThanOrEqual(1);
  });

  it("shows error for short password", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getAllByPlaceholderText("your@email.com")[0], "a@b.com");
    await user.type(screen.getAllByPlaceholderText("至少 8 个字符")[0], "short");
    await user.click(screen.getAllByRole("button", { name: "创建账户" })[0]);

    expect(screen.getAllByText("密码至少 8 个字符").length).toBeGreaterThanOrEqual(1);
  });

  it("form has correct structure for submission", () => {
    render(<RegisterPage />);
    const form = screen.getAllByPlaceholderText("your@email.com")[0].closest("form");
    expect(form).toBeInTheDocument();
    const submitBtn = screen.getAllByRole("button", { name: "创建账户" })[0];
    expect(submitBtn).not.toBeDisabled();
  });
});

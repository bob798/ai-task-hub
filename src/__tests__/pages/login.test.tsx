import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/login",
}));

import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
  });

  it("renders login form with email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("至少 8 个字符")).toBeInTheDocument();
  });

  it("renders OAuth buttons", () => {
    render(<LoginPage />);
    expect(screen.getAllByText("使用 GitHub 登录").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("使用 Google 登录").length).toBeGreaterThanOrEqual(1);
  });

  it("renders register link", () => {
    render(<LoginPage />);
    expect(screen.getAllByText("立即注册").length).toBeGreaterThanOrEqual(1);
  });

  it("login button is present and labeled correctly", () => {
    render(<LoginPage />);
    const loginBtns = screen.getAllByRole("button", { name: "登录" });
    expect(loginBtns.length).toBeGreaterThanOrEqual(1);
    expect(loginBtns[0]).toHaveAttribute("type", "submit");
  });

  it("calls signIn with credentials on form submission", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });

    const emailInput = screen.getAllByPlaceholderText("your@email.com")[0];
    const passwordInput = screen.getAllByPlaceholderText("至少 8 个字符")[0];
    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "wrongpass");

    const loginBtn = screen.getAllByRole("button", { name: "登录" })[0];
    await user.click(loginBtn);

    expect(mockSignIn).toHaveBeenCalledWith("credentials", expect.objectContaining({
      email: "test@test.com",
      password: "wrongpass",
      redirect: false,
    }));
  });

  it("calls signIn with github on OAuth button click", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    mockSignIn.mockResolvedValue(undefined);
    await user.click(screen.getAllByText("使用 GitHub 登录")[0]);

    expect(mockSignIn).toHaveBeenCalledWith("github", expect.objectContaining({
      callbackUrl: expect.any(String),
    }));
  });

  it("calls signIn with google on OAuth button click", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    mockSignIn.mockResolvedValue(undefined);
    await user.click(screen.getAllByText("使用 Google 登录")[0]);

    expect(mockSignIn).toHaveBeenCalledWith("google", expect.objectContaining({
      callbackUrl: expect.any(String),
    }));
  });
});

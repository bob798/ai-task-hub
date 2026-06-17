import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignOut = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import Navbar from "@/components/Navbar";

describe("Navbar - logged out", () => {
  it("renders logo", () => {
    render(<Navbar />);
    expect(screen.getByText("Task Hub")).toBeInTheDocument();
  });

  it("renders all nav links with correct labels", () => {
    render(<Navbar />);
    expect(screen.getAllByText("图片创作").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("代码创作").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("智能文档").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("定价").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("我的作品").length).toBeGreaterThanOrEqual(1);
  });

  it("shows login button when not authenticated", () => {
    render(<Navbar />);
    expect(screen.getAllByText("登录").length).toBeGreaterThanOrEqual(1);
  });

  it("login button links to /login", () => {
    render(<Navbar />);
    const loginLink = screen.getAllByText("登录")[0].closest("a");
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});

describe("Navbar - mobile menu", () => {
  it("hamburger button exists and toggles menu", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const hamburgers = screen.getAllByLabelText("Toggle menu");
    expect(hamburgers.length).toBeGreaterThanOrEqual(1);

    const before = screen.getAllByText("图片创作").length;
    await user.click(hamburgers[0]);
    const after = screen.getAllByText("图片创作").length;
    expect(after).toBeGreaterThan(before);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "u1", name: "Test" } }, status: "authenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/account/invite",
}));

import InvitePage from "@/app/account/invite/page";

function makeFetchMock(inviteCode: string, stats: { count: number; totalRewards: number }) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
    if (String(url).includes("/api/user/invite-code")) {
      return Promise.resolve(
        new Response(JSON.stringify({ inviteCode }), { status: 200 })
      );
    }
    if (String(url).includes("/api/user/invite-stats")) {
      return Promise.resolve(
        new Response(JSON.stringify(stats), { status: 200 })
      );
    }
    return Promise.resolve(new Response("{}", { status: 200 }));
  });
}

describe("InvitePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page with invite-related content", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    render(<InvitePage />);
    expect(screen.getAllByText(/邀请好友/)[0]).toBeInTheDocument();
  });

  it("shows invite code after loading", async () => {
    makeFetchMock("ABC123", { count: 0, totalRewards: 0 });
    render(<InvitePage />);
    const codeEl = await screen.findAllByText("ABC123");
    expect(codeEl.length).toBeGreaterThanOrEqual(1);
  });

  it("has 复制邀请链接 copy button", async () => {
    makeFetchMock("XYZ789", { count: 0, totalRewards: 0 });
    render(<InvitePage />);
    const buttons = await screen.findAllByText("复制邀请链接");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows invite stats count and rewards", async () => {
    makeFetchMock("CODE42", { count: 5, totalRewards: 10 });
    render(<InvitePage />);
    const countEl = await screen.findAllByText("5");
    expect(countEl.length).toBeGreaterThanOrEqual(1);
    const rewardEl = await screen.findAllByText("¥10.00");
    expect(rewardEl.length).toBeGreaterThanOrEqual(1);
  });
});

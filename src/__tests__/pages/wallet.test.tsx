import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "u1", name: "Test" } }, status: "authenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/wallet",
  useSearchParams: () => new URLSearchParams(),
}));

import WalletPage from "@/app/wallet/page";

const MOCK_TRANSACTIONS = [
  {
    id: "tx-1",
    type: "TOPUP",
    amount: "10.00",
    balanceAfter: "10.00",
    description: "充值",
    paymentMethod: "wechat",
    status: "SUCCESS",
    createdAt: "2026-01-01T09:00:00.000Z",
  },
  {
    id: "tx-2",
    type: "DEDUCT",
    amount: "-0.50",
    balanceAfter: "9.50",
    description: "图片生成",
    paymentMethod: null,
    status: "SUCCESS",
    createdAt: "2026-01-02T10:30:00.000Z",
  },
];

function makeFetchMock(balance: number, transactions: typeof MOCK_TRANSACTIONS) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
    if (String(url).includes("/api/user/balance")) {
      return Promise.resolve(
        new Response(JSON.stringify({ balance }), { status: 200 })
      );
    }
    if (String(url).includes("/api/user/transactions")) {
      return Promise.resolve(
        new Response(JSON.stringify({ transactions }), { status: 200 })
      );
    }
    return Promise.resolve(new Response("{}", { status: 200 }));
  });
}

describe("WalletPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    render(<WalletPage />);
    expect(screen.getAllByText("加载中...").length).toBeGreaterThanOrEqual(1);
  });

  it("shows balance after loading", async () => {
    makeFetchMock(25.5, []);
    render(<WalletPage />);
    expect(await screen.findByText("¥25.50")).toBeInTheDocument();
  });

  it("shows 立即充值 button linking to /account/topup", async () => {
    makeFetchMock(0, []);
    render(<WalletPage />);
    await screen.findByText("当前余额");
    const links = screen.getAllByRole("link", { name: "立即充值" });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("href", "/account/topup");
  });

  it("shows empty transaction state", async () => {
    makeFetchMock(5, []);
    render(<WalletPage />);
    const matches = await screen.findAllByText(/还没有收支记录/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows transactions list when data returned", async () => {
    makeFetchMock(9.5, MOCK_TRANSACTIONS);
    render(<WalletPage />);
    expect(await screen.findByText("充值")).toBeInTheDocument();
    expect(screen.getAllByText("图片生成").length).toBeGreaterThanOrEqual(1);
  });

  it("创作第一件作品 link points to /create/image", async () => {
    makeFetchMock(0, []);
    render(<WalletPage />);
    const links = await screen.findAllByRole("link", { name: /创作第一件作品/ });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("href", "/create/image");
  });
});

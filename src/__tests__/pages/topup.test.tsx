import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "u1" } }, status: "authenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/account/topup",
}));

import TopupPage from "@/app/account/topup/page";

describe("TopupPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ balance: 5.0 }), { status: 200 })
    );
  });

  it("renders page title", () => {
    render(<TopupPage />);
    expect(screen.getAllByText(/充值/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders 4 recharge packages", () => {
    render(<TopupPage />);
    expect(screen.getAllByText("¥10").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("¥50").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("¥100").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("¥200").length).toBeGreaterThanOrEqual(1);
  });

  it("renders payment method buttons", () => {
    render(<TopupPage />);
    expect(screen.getAllByText("支付宝").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Stripe（国际卡）").length).toBeGreaterThanOrEqual(1);
  });

  it("renders confirm button", () => {
    render(<TopupPage />);
    expect(screen.getAllByText("确认充值").length).toBeGreaterThanOrEqual(1);
  });

  it("can select a different package", async () => {
    const user = userEvent.setup();
    render(<TopupPage />);

    await user.click(screen.getAllByText("¥100")[0]);
    expect(screen.getAllByText(/赠送 ¥15/).length).toBeGreaterThanOrEqual(1);
  });

  it("calls alipay API by default on confirm", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ balance: 5.0 }))) // balance fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "https://alipay.com/pay" }))); // payment

    render(<TopupPage />);

    await user.click(screen.getAllByText("确认充值")[0]);

    const calls = fetchSpy.mock.calls;
    const paymentCall = calls.find((c) => String(c[0]).includes("/api/payment/alipay"));
    expect(paymentCall).toBeDefined();
  });

  it("calls stripe API when stripe selected", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ balance: 5.0 }))) // balance fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "https://checkout.stripe.com" }))); // payment

    render(<TopupPage />);

    await user.click(screen.getAllByText("Stripe（国际卡）")[0]);
    await user.click(screen.getAllByText("确认充值")[0]);

    const calls = fetchSpy.mock.calls;
    const paymentCall = calls.find((c) => String(c[0]).includes("/api/payment/stripe"));
    expect(paymentCall).toBeDefined();
  });
});

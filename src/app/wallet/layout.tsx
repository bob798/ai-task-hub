import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的钱包 — AI Task Hub",
  description: "查看余额、充值，以及收支明细",
};

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

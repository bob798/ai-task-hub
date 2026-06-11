import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "透明定价 — AI Task Hub",
  description: "按需付费，无隐藏费用。查看图片生成、代码生成等服务的详细定价。",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

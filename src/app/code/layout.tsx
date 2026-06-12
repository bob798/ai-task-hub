import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 代码生成 — AI Task Hub",
  description: "描述需求，AI 自动生成高质量代码",
};

export default function CodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

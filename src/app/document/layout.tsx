import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 文档处理 — AI Task Hub",
  description: "智能总结、翻译、分析各类文档文本",
};

export default function DocumentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

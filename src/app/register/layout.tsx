import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "注册 — AI Task Hub",
  description: "注册 AI Task Hub 账户，开始使用 AI 驱动的任务完成平台。",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

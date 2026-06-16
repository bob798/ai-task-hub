import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 — AI Task Hub",
  description: "登录 AI Task Hub，使用 AI 驱动的任务完成平台。",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

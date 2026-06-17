import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "代码创作 — AI Task Hub",
  description: "描述需求，AI 为你编写高质量代码",
};
export default function CreateCodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

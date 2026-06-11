import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "任务历史 — AI Task Hub",
  description: "查看您的历史任务记录，包括图片生成、代码生成等任务的详情与费用。",
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

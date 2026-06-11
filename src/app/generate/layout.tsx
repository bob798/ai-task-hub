import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 图片生成 — AI Task Hub",
  description: "使用 AI 根据文字描述生成高质量图片",
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

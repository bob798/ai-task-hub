import type { Metadata } from "next";
import { prisma } from "@/lib/db";

const TYPE_LABELS: Record<string, string> = {
  image_generation: "AI 图片",
  code_generation: "AI 代码",
  document_processing: "AI 文档",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const task = await prisma.task.findUnique({
    where: { shareToken: token },
    select: { type: true, prompt: true },
  });

  if (!task) {
    return { title: "分享内容 — AI Task Hub" };
  }

  const typeLabel = TYPE_LABELS[task.type] ?? "AI 作品";
  const promptSnippet = task.prompt.slice(0, 60);

  return {
    title: `${typeLabel}: ${promptSnippet} — AI Task Hub`,
    description: `查看由 AI Task Hub 生成的${typeLabel}：${promptSnippet}`,
  };
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

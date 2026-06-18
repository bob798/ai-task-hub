import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

const TYPE_LABELS: Record<string, string> = {
  image_generation: "图片生成",
  code_generation: "代码生成",
  document_processing: "文档处理",
};

interface ImageResult {
  images?: { url: string }[];
}

interface CodeResult {
  code?: string;
  language?: string;
}

interface DocumentResult {
  text?: string;
  content?: string;
  result?: string;
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const task = await prisma.task.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      type: true,
      status: true,
      prompt: true,
      params: true,
      result: true,
      createdAt: true,
    },
  });

  if (!task) notFound();

  const typeLabel = TYPE_LABELS[task.type] ?? task.type;

  function renderResult() {
    if (task!.status !== "COMPLETED" || !task!.result) {
      return (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-400">
          该作品尚未完成或生成失败。
        </div>
      );
    }

    if (task!.type === "image_generation") {
      const result = task!.result as ImageResult;
      const images = result?.images ?? [];
      if (images.length === 0) {
        return <p className="text-sm text-gray-400">暂无图片数据。</p>;
      }
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={img.url}
              alt={`生成图片 ${i + 1}`}
              className="w-full rounded-xl object-cover shadow-lg"
            />
          ))}
        </div>
      );
    }

    if (task!.type === "code_generation") {
      const result = task!.result as CodeResult;
      const code = result?.code ?? "";
      const language = result?.language ?? "text";
      return (
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
            <span className="text-xs font-medium text-gray-400">{language}</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-gray-100">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    if (task!.type === "document_processing") {
      const result = task!.result as DocumentResult;
      const text = result?.text ?? result?.content ?? result?.result ?? "";
      return (
        <div className="rounded-xl border border-gray-700 bg-gray-900 px-6 py-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
            {text || "暂无内容。"}
          </p>
        </div>
      );
    }

    return (
      <pre className="overflow-auto rounded-xl border border-gray-700 bg-gray-900 p-4 text-xs text-gray-300">
        {JSON.stringify(task!.result, null, 2)}
      </pre>
    );
  }

  const createdDate = new Date(task.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background, #0f0f12)", color: "var(--foreground, #f1f1f3)" }}>
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            AI Task Hub
          </Link>
          <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-medium text-indigo-400">
            {typeLabel}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <p className="text-xs text-gray-500">{createdDate} · {typeLabel}</p>
          <h1 className="mt-2 text-xl font-semibold leading-snug text-gray-100">
            {task.prompt}
          </h1>
        </div>

        {renderResult()}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 text-center">
        <p className="text-sm text-gray-500">
          由{" "}
          <Link href="/" className="font-semibold text-indigo-400 hover:underline">
            AI Task Hub
          </Link>{" "}
          提供支持
        </p>
        <p className="mt-2 text-xs text-gray-600">
          还没有账户？{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            免费注册，立即开始 AI 创作
          </Link>
        </p>
      </footer>
    </div>
  );
}

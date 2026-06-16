"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
function formatTaskTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return String(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

interface TaskItem {
  id: string;
  type: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  prompt: string;
  params: Record<string, unknown> | null;
  cost: string;
  errorMsg: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  COMPLETED: {
    label: "已完成",
    className: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/30",
    dot: "bg-emerald-400",
  },
  FAILED: {
    label: "失败",
    className: "bg-red-500/10 text-red-400 ring-1 ring-red-400/30",
    dot: "bg-red-400",
  },
  PENDING: {
    label: "等待中",
    className: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-400/30",
    dot: "bg-amber-400 animate-pulse",
  },
  PROCESSING: {
    label: "处理中",
    className: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-400/30",
    dot: "bg-amber-400 animate-pulse",
  },
};

const TYPE_LABELS: Record<string, string> = {
  image_generation: "图片生成",
  code_generation: "代码生成",
  document_processing: "文档处理",
};

function getTaskDetail(task: TaskItem): string {
  const params = task.params || {};
  if (task.type === "image_generation") {
    const quality = params.quality === "hd" ? "高清" : "标准";
    const size = String(params.size || "1024x1024").replace("x", "×");
    const count = params.count || 1;
    return `${quality}质量 ${size} × ${count} 张`;
  }
  if (task.type === "code_generation") {
    return String(params.language || "TypeScript");
  }
  if (task.type === "document_processing") {
    return String(params.mode || "summarize");
  }
  return "";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/user/tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalCost = tasks
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + parseFloat(t.cost), 0)
    .toFixed(2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted)" }}>加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <section className="relative overflow-hidden py-20 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <p className="mb-4 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400">
          我的账户
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          任务<span className="gradient-text">历史</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--muted)]">
          查看您所有的历史任务记录，包括生成详情和费用明细。
        </p>
      </section>

      {tasks.length > 0 && (
        <div className="mx-auto mb-8 max-w-4xl px-4">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{total}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">总任务数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">已完成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">¥{totalCost}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">累计消费</p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 pb-24">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-24 text-center">
            <div className="text-6xl opacity-40">🖼️</div>
            <div>
              <p className="text-lg font-medium text-[var(--foreground)]">还没有任务记录</p>
              <p className="mt-2 text-sm text-[var(--muted)]">去生成第一张图片吧！</p>
            </div>
            <Link
              href="/generate"
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-hero)" }}
            >
              立即生成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.PENDING;
              const detail = getTaskDetail(task);
              const description =
                task.status === "FAILED" && task.errorMsg
                  ? `${detail} — ${task.errorMsg}`
                  : `${detail} — ${task.prompt}`;

              return (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                        {TYPE_LABELS[task.type] || task.type}
                      </span>
                      <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="truncate text-sm text-[var(--muted)]">{description}</p>
                    <p className="text-xs text-[var(--muted)] opacity-70">
                      {formatTaskTime(task.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className={`text-xl font-bold ${task.status === "FAILED" ? "text-[var(--muted)]" : "text-indigo-400"}`}>
                      {task.status === "FAILED" ? "¥0.00" : `¥${parseFloat(task.cost).toFixed(2)}`}
                    </p>
                    {task.status === "COMPLETED" && <p className="text-xs text-[var(--muted)]">已扣费</p>}
                    {task.status === "FAILED" && <p className="text-xs text-red-400">已退款</p>}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/generate"
                className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-hero)" }}
              >
                继续创作
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

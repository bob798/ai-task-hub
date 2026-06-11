"use client";

import Link from "next/link";
import { useState } from "react";

type TaskStatus = "completed" | "processing" | "failed";

interface Task {
  id: string;
  type: string;
  status: TaskStatus;
  createdAt: string;
  cost: string;
  description: string;
}

const MOCK_TASKS: Task[] = [
  {
    id: "task_001",
    type: "图片生成",
    status: "completed",
    createdAt: "2026-06-11 14:32:08",
    cost: "¥0.50",
    description: "高清质量 1024×1024 — 赛博朋克城市夜景，霓虹灯反射在雨后街道",
  },
  {
    id: "task_002",
    type: "图片生成",
    status: "completed",
    createdAt: "2026-06-11 13:15:44",
    cost: "¥0.30",
    description: "标准质量 1024×1024 — 极简主义风格的咖啡杯插画，白色背景",
  },
  {
    id: "task_003",
    type: "图片生成",
    status: "failed",
    createdAt: "2026-06-10 22:08:30",
    cost: "¥0.00",
    description: "高清质量 其他尺寸 — 生成失败，内容审核未通过",
  },
  {
    id: "task_004",
    type: "图片生成",
    status: "completed",
    createdAt: "2026-06-10 18:47:12",
    cost: "¥0.40",
    description: "标准质量 其他尺寸 — 森林中的古老神殿，阳光穿透树冠洒落地面",
  },
  {
    id: "task_005",
    type: "图片生成",
    status: "processing",
    createdAt: "2026-06-11 14:55:00",
    cost: "—",
    description: "高清质量 1024×1024 — 未来感太空站内部，宇航员漂浮在失重环境中",
  },
];

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string; dot: string }
> = {
  completed: {
    label: "已完成",
    className: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/30",
    dot: "bg-emerald-400",
  },
  processing: {
    label: "处理中",
    className: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-400/30",
    dot: "bg-amber-400 animate-pulse",
  },
  failed: {
    label: "失败",
    className: "bg-red-500/10 text-red-400 ring-1 ring-red-400/30",
    dot: "bg-red-400",
  },
};

export default function TasksPage() {
  const [tasks] = useState<Task[]>(MOCK_TASKS);

  const totalCost = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.cost.replace("¥", "")), 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%)",
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

      {/* Stats bar */}
      {tasks.length > 0 && (
        <div className="mx-auto mb-8 max-w-4xl px-4">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{tasks.length}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">总任务数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {tasks.filter((t) => t.status === "completed").length}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">已完成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">¥{totalCost}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">累计消费</p>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <main className="mx-auto max-w-4xl px-4 pb-24">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-24 text-center">
            <div className="text-6xl opacity-40">🖼️</div>
            <div>
              <p className="text-lg font-medium text-[var(--foreground)]">
                还没有任务记录
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                去生成第一张图片吧！
              </p>
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
              const status = STATUS_CONFIG[task.status];
              return (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left: info */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-[var(--muted)]">
                        #{task.id}
                      </span>
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                        {task.type}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="truncate text-sm text-[var(--muted)]">
                      {task.description}
                    </p>
                    <p className="text-xs text-[var(--muted)] opacity-70">
                      {task.createdAt}
                    </p>
                  </div>

                  {/* Right: cost */}
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-xl font-bold ${
                        task.status === "failed"
                          ? "text-[var(--muted)]"
                          : "text-indigo-400"
                      }`}
                    >
                      {task.cost}
                    </p>
                    {task.status !== "failed" && task.cost !== "—" && (
                      <p className="text-xs text-[var(--muted)]">已扣费</p>
                    )}
                    {task.status === "failed" && (
                      <p className="text-xs text-red-400">未扣费</p>
                    )}
                    {task.status === "processing" && (
                      <p className="text-xs text-amber-400">处理中</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Notice */}
            <p className="pt-4 text-center text-xs text-[var(--muted)]">
              以上为模拟数据，真实任务记录将在接入数据库后展示。
            </p>

            {/* CTA */}
            <div className="pt-2 text-center">
              <Link
                href="/generate"
                className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-hero)" }}
              >
                继续生成图片
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  clearTasks,
  formatTaskTime,
  getServerTasksSnapshot,
  getTasksSnapshot,
  subscribeTasks,
  type TaskStatus,
} from "@/lib/tasks";

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string; dot: string }
> = {
  completed: {
    label: "已完成",
    className: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/30",
    dot: "bg-emerald-400",
  },
  failed: {
    label: "失败",
    className: "bg-red-500/10 text-red-400 ring-1 ring-red-400/30",
    dot: "bg-red-400",
  },
};

export default function TasksPage() {
  const tasks = useSyncExternalStore(
    subscribeTasks,
    getTasksSnapshot,
    getServerTasksSnapshot
  );

  const handleClear = () => {
    if (window.confirm("确定要清空所有任务记录吗？此操作不可恢复。")) {
      clearTasks();
    }
  };

  const totalCost = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.cost, 0)
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
          查看您所有的历史任务记录，包括生成详情和费用明细。记录保存在本浏览器中。
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
              const description =
                task.status === "failed" && task.error
                  ? `${task.detail} — ${task.error}`
                  : `${task.detail} — ${task.prompt}`;
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
                      {task.mock && (
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-amber-400/30">
                          演示模式
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-[var(--muted)]">
                      {description}
                    </p>
                    <p className="text-xs text-[var(--muted)] opacity-70">
                      {formatTaskTime(task.createdAt)}
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
                      {task.status === "failed" ? "¥0.00" : `¥${task.cost.toFixed(2)}`}
                    </p>
                    {task.status === "completed" && (
                      <p className="text-xs text-[var(--muted)]">已扣费</p>
                    )}
                    {task.status === "failed" && (
                      <p className="text-xs text-red-400">未扣费</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/generate"
                className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-hero)" }}
              >
                继续生成图片
              </Link>
              <button
                onClick={handleClear}
                className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--muted)] transition-colors hover:border-red-400/50 hover:text-red-400"
              >
                清空记录
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

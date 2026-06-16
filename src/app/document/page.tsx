"use client";

import Link from "next/link";
import { useState } from "react";
import { DOC_PRICE } from "@/lib/pricing";
import { DOC_MAX_LENGTH, DOC_MODES, type DocMode } from "@/lib/document";
import { addTask } from "@/lib/tasks";
import { canAfford, deduct } from "@/lib/wallet";

interface DocResult {
  result: string;
  cost: number;
  mock?: boolean;
  error?: string;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function DocumentPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<DocMode>("summarize");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needRecharge, setNeedRecharge] = useState(false);
  const [copied, setCopied] = useState(false);

  const modeLabel = DOC_MODES.find((m) => m.key === mode)!.label;

  const handleProcess = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("请输入要处理的文本");
      return;
    }

    if (!canAfford(DOC_PRICE)) {
      setNeedRecharge(true);
      setError(`余额不足，本次预计消耗 ¥${DOC_PRICE.toFixed(2)}，请先充值`);
      return;
    }

    setLoading(true);
    setError(null);
    setNeedRecharge(false);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, mode }),
      });

      const data: DocResult = await response.json();
      const promptSummary = trimmed.slice(0, 100);

      if (!response.ok || data.error) {
        const message = data.error ?? "处理失败，请稍后重试";
        setError(message);
        addTask({
          type: "文档处理",
          status: "failed",
          cost: 0,
          prompt: promptSummary,
          detail: modeLabel,
          mock: false,
          error: message,
        });
      } else {
        deduct(data.cost, "文档处理");
        setResult(data);
        addTask({
          type: "文档处理",
          status: "completed",
          cost: data.cost,
          prompt: promptSummary,
          detail: modeLabel,
          mock: data.mock ?? false,
        });
      }
    } catch {
      setError("网络请求失败，请检查连接后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时忽略
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI 文档处理
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            粘贴文本，AI 帮你总结、翻译、分析
          </p>
        </div>

        {/* 输入区域 */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            文本内容
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="粘贴需要处理的文档内容，支持中英文，最长 8000 字符..."
            className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            maxLength={DOC_MAX_LENGTH}
          />
          <div className="mt-1 flex justify-end">
            <span className="text-xs text-zinc-400">
              {text.length} / {DOC_MAX_LENGTH}
            </span>
          </div>

          {/* 处理模式 */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              处理方式
            </label>
            <div className="flex flex-wrap gap-2">
              {DOC_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    mode === m.key
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 处理按钮 */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            预计费用：
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              ¥{DOC_PRICE.toFixed(2)}
            </span>
          </p>
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Spinner />
                处理中…
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                开始处理
              </>
            )}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <span>{error}</span>
            {needRecharge && (
              <Link
                href="/wallet"
                className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
              >
                去充值
              </Link>
            )}
          </div>
        )}

        {/* 结果区域 */}
        {result && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                处理结果
                {result.mock && (
                  <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                    演示模式
                  </span>
                )}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                本次消耗：
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ¥{result.cost.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/80 px-4 py-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {modeLabel}
                </span>
                <button
                  onClick={handleCopy}
                  className="rounded-md px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  {copied ? "✓ 已复制" : "复制结果"}
                </button>
              </div>
              <p className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {result.result}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

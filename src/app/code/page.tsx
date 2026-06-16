"use client";

import Link from "next/link";
import { useState } from "react";
import { CODE_PRICE } from "@/lib/pricing";
import { LANGUAGES, type CodeLanguage } from "@/lib/code";

interface CodeResult {
  code: string;
  cost: number;
  mock?: boolean;
  error?: string;
}

/** 提取 Markdown 代码块内容；无代码块时原样返回 */
function extractCode(markdown: string): string {
  const match = markdown.match(/```[\w-]*\n([\s\S]*?)```/);
  return match ? match[1].trimEnd() : markdown;
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

export default function CodePage() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<CodeLanguage>("TypeScript");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needRecharge, setNeedRecharge] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("请输入代码需求描述");
      return;
    }

    setLoading(true);
    setError(null);
    setNeedRecharge(false);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, language }),
      });

      const data: CodeResult = await response.json();

      if (response.status === 402) {
        setNeedRecharge(true);
        setError(data.error ?? "余额不足，请先充值");
      } else if (!response.ok || data.error) {
        setError(data.error ?? "生成失败，请稍后重试");
      } else {
        setResult(data);
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
      await navigator.clipboard.writeText(extractCode(result.code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时忽略
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI 代码生成
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            描述你的需求，AI 将为你生成可运行的代码
          </p>
        </div>

        {/* 输入区域 */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            需求描述
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="描述你想实现的功能，例如：实现一个带防抖的搜索输入框组件，支持自定义延迟时间..."
            className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            maxLength={4000}
          />
          <div className="mt-1 flex justify-end">
            <span className="text-xs text-zinc-400">{prompt.length} / 4000</span>
          </div>

          {/* 语言选择 */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              编程语言
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    language === lang
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              预计费用：
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                ¥{CODE_PRICE.toFixed(2)}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              按 ⌘ + Enter 快速生成
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Spinner />
                生成中…
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
                    d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                  />
                </svg>
                生成代码
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
                生成结果
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

            <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-md overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-700/60 bg-zinc-800/80 px-4 py-2">
                <span className="text-xs font-medium text-zinc-400">{language}</span>
                <button
                  onClick={handleCopy}
                  className="rounded-md px-3 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
                >
                  {copied ? "✓ 已复制" : "复制代码"}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-100">
                <code>{extractCode(result.code)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

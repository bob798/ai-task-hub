"use client";

import Link from "next/link";
import { useState } from "react";
import { calculateTotalCost, type ImageQuality, type ImageSize } from "@/lib/pricing";

interface GeneratedImage {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

interface GenerateResult {
  images: GeneratedImage[];
  cost: number;
  mock?: boolean;
  error?: string;
}

const SIZE_OPTIONS: { label: string; value: ImageSize }[] = [
  { label: "1024 × 1024（正方形）", value: "1024x1024" },
  { label: "1024 × 1792（竖版）", value: "1024x1792" },
  { label: "1792 × 1024（横版）", value: "1792x1024" },
];

const QUALITY_OPTIONS: { label: string; value: ImageQuality; desc: string }[] = [
  { label: "标准", value: "standard", desc: "速度快，适合快速预览" },
  { label: "高清", value: "hd", desc: "细节丰富，适合精品输出" },
];

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

function DownloadButton({ url, index }: { url: string; index: number }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `ai-image-${index + 1}.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // 回退到直接打开链接
      window.open(url, "_blank");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      下载图片
    </button>
  );
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [quality, setQuality] = useState<ImageQuality>("standard");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needRecharge, setNeedRecharge] = useState(false);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("请输入图片描述");
      return;
    }

    setLoading(true);
    setError(null);
    setNeedRecharge(false);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, size, quality, n: count }),
      });

      const data = await response.json();

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
            图片创作
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            描述你想要的画面，AI 为你创作
          </p>
        </div>

        {/* 输入区域 */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            创作描述
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="描述你想要生成的图片，例如：一只在星空下奔跑的金色柴犬，8K 写实风格..."
            className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            maxLength={4000}
          />
          <div className="mt-1 flex justify-end">
            <span className="text-xs text-zinc-400">{prompt.length} / 4000</span>
          </div>

          {/* 参数选项 */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 尺寸 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                图片尺寸
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as ImageSize)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 质量 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                图片质量
              </label>
              <div className="flex gap-2">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuality(opt.value)}
                    title={opt.desc}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      quality === opt.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 数量 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                生成数量
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCount((c) => Math.max(1, c - 1))}
                  disabled={count <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {count}
                </span>
                <button
                  onClick={() => setCount((c) => Math.min(4, c + 1))}
                  disabled={count >= 4}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ＋
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              预计费用：
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                ¥{calculateTotalCost(quality, size, count).toFixed(2)}
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
                创作中…
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
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                开始创作
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
            {/* 费用信息 */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                创作完成
                {result.mock && (
                  <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                    演示模式
                  </span>
                )}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                本次费用：
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ¥{result.cost.toFixed(2)}
                </span>
              </p>
            </div>

            {/* 图片网格 */}
            <div
              className={`grid gap-4 ${
                result.images.length === 1
                  ? "grid-cols-1 max-w-xl mx-auto"
                  : result.images.length === 2
                  ? "grid-cols-2"
                  : result.images.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2"
              }`}
            >
              {result.images.map((img, index) => {
                const src = img.url ?? (img.b64_json ? `data:image/png;base64,${img.b64_json}` : null);
                if (!src) return null;
                return (
                  <div key={index} className="flex flex-col">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`生成图片 ${index + 1}`}
                      className="w-full rounded-xl object-cover shadow-md"
                    />
                    {img.revised_prompt && (
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">
                        {img.revised_prompt}
                      </p>
                    )}
                    <DownloadButton url={src} index={index} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          出了点问题
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
          {error.message || "发生了意外错误，请稍后重试。"}
        </p>
        <button
          onClick={reset}
          className="rounded-full px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "var(--gradient-hero)" }}
        >
          重试
        </button>
      </div>
    </div>
  );
}

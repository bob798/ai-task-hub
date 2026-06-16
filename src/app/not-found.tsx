import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="text-center max-w-md">
        <p className="text-8xl font-black gradient-text mb-4">404</p>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          页面未找到
        </h1>
        <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
          您访问的页面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "var(--gradient-hero)" }}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

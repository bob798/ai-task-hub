import Link from "next/link";

const footerLinks = [
  { href: "/", label: "首页" },
  { href: "/generate", label: "图片生成" },
  { href: "/code", label: "代码生成" },
  { href: "/document", label: "文档处理" },
  { href: "/pricing", label: "定价" },
  { href: "/tasks", label: "任务历史" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-auto"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-bold text-base gradient-text">AI Task Hub</span>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              AI 驱动的任务完成平台
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--muted)" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-center md:text-right" style={{ color: "var(--muted)" }}>
            &copy; {year} AI Task Hub. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
}

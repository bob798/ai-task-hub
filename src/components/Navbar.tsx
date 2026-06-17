"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/create/image", label: "图片创作" },
  { href: "/create/code", label: "代码创作" },
  { href: "/create/document", label: "智能文档" },
  { href: "/pricing", label: "定价" },
  { href: "/gallery", label: "我的作品" },
];

function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
        style={{
          background: "var(--gradient-hero)",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
        }}
      >
        登录
      </Link>
    );
  }

  const user = session.user;
  const initial = (user.name?.[0] || user.email?.[0] || "U").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-6 w-6 rounded-full" />
        ) : (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--gradient-hero)" }}
          >
            {initial}
          </span>
        )}
        <span className="max-w-[100px] truncate">{user.name || user.email}</span>
        <svg className="h-3.5 w-3.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl border py-1 shadow-xl z-50"
          style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
        >
          <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{user.email}</p>
          </div>
          <Link
            href="/wallet"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--foreground)" }}
          >
            💰 我的钱包
          </Link>
          <Link
            href="/gallery"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--foreground)" }}
          >
            🎨 我的作品
          </Link>
          <div className="border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:opacity-80"
            >
              🚪 退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(6, 7, 26, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
              style={{ background: "var(--gradient-hero)" }}
            >
              AI
            </span>
            <span className="gradient-text">Task Hub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: active ? "var(--primary)" : "var(--muted)",
                    background: active ? "rgba(99, 102, 241, 0.1)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground)";
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)";
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <UserMenu />
          </div>

          {/* Mobile: Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--muted)" }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="md:hidden pb-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: active ? "var(--primary)" : "var(--muted)",
                      background: active ? "rgba(99, 102, 241, 0.1)" : "transparent",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {session?.user ? (
                <>
                  <Link
                    href="/wallet"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    💰 我的钱包
                  </Link>
                  <div className="px-4 pt-2">
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full py-2.5 rounded-full text-sm font-semibold text-red-400 border transition-colors"
                      style={{ borderColor: "var(--border)" }}
                    >
                      退出登录
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full py-2.5 rounded-full text-sm font-semibold text-white text-center"
                    style={{ background: "var(--gradient-hero)" }}
                  >
                    登录
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

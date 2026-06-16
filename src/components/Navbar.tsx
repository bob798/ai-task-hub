"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  getServerWalletSnapshot,
  getWalletSnapshot,
  subscribeWallet,
} from "@/lib/wallet";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/generate", label: "图片生成" },
  { href: "/code", label: "代码生成" },
  { href: "/document", label: "文档处理" },
  { href: "/pricing", label: "定价" },
  { href: "/tasks", label: "任务历史" },
];

function BalancePill() {
  const wallet = useSyncExternalStore(
    subscribeWallet,
    getWalletSnapshot,
    getServerWalletSnapshot
  );
  return (
    <Link
      href="/wallet"
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors"
      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
      title="我的钱包"
    >
      <span>💰</span>
      <span className="gradient-text">¥{wallet.balance.toFixed(2)}</span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
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

          {/* Right: CTA */}
          <div className="hidden md:flex items-center gap-3">
            <BalancePill />
            <Link
              href="/generate"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
              style={{
                background: "var(--gradient-hero)",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
              }}
            >
              开始创作
            </Link>
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
              <Link
                href="/wallet"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: pathname === "/wallet" ? "var(--primary)" : "var(--muted)",
                  background:
                    pathname === "/wallet" ? "rgba(99, 102, 241, 0.1)" : "transparent",
                }}
              >
                💰 我的钱包
              </Link>
              <div className="px-4 pt-2">
                <Link
                  href="/generate"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-2.5 rounded-full text-sm font-semibold text-white text-center"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  开始创作
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

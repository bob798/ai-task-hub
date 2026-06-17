"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopupSuccessPage() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user/balance")
      .then((r) => r.json())
      .then((d) => setBalance(d.balance))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          充值成功！
        </h1>
        {balance !== null && (
          <p className="text-lg mb-6" style={{ color: "var(--muted)" }}>
            当前余额：<span className="font-bold gradient-text">¥{balance.toFixed(2)}</span>
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/create/image"
            className="rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "var(--gradient-hero)" }}
          >
            开始创作
          </Link>
          <Link
            href="/wallet"
            className="rounded-full border px-6 py-3 text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            查看钱包
          </Link>
        </div>
      </div>
    </div>
  );
}

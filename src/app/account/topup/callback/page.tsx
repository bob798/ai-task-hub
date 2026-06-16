"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AlipayCallbackPage() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    // Poll balance a few times to wait for async notification
    let attempts = 0;
    const poll = () => {
      fetch("/api/user/balance")
        .then((r) => r.json())
        .then((d) => setBalance(d.balance))
        .catch(() => {});
      attempts++;
      if (attempts < 5) {
        setTimeout(poll, 2000);
      }
    };
    poll();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          支付处理中
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
          支付结果正在确认中，余额将在几秒内更新。
        </p>
        {balance !== null && (
          <p className="text-lg mb-6" style={{ color: "var(--muted)" }}>
            当前余额：<span className="font-bold gradient-text">¥{balance.toFixed(2)}</span>
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/generate"
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

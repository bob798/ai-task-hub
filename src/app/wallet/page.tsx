"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface TransactionItem {
  id: string;
  type: string;
  amount: string;
  balanceAfter: string;
  description: string | null;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/balance").then((r) => r.json()),
      fetch("/api/user/transactions").then((r) => r.json()),
    ])
      .then(([balData, txData]) => {
        setBalance(balData.balance ?? 0);
        setTransactions(txData.transactions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted)" }}>加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <section className="relative overflow-hidden py-16 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
        />
        <p className="mb-4 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400">
          我的账户
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          我的<span className="gradient-text">钱包</span>
        </h1>
      </section>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* Balance card */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl p-8 text-white shadow-lg"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute top-0 right-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10" />
          <p className="text-sm text-white/80">当前余额</p>
          <p className="mt-2 text-5xl font-black tracking-tight">
            ¥{(balance ?? 0).toFixed(2)}
          </p>
          <p className="mt-3 text-xs text-white/70">余额长期有效，按次扣费，生成失败自动退款</p>
          <Link
            href="/account/topup"
            className="mt-4 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ color: "#6366f1" }}
          >
            立即充值
          </Link>
        </div>

        {/* Transactions */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">收支明细</h2>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--muted)]">
                还没有收支记录。
                <Link href="/generate" className="ml-1 text-indigo-400 hover:opacity-80">去生成第一个任务 →</Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {transactions.map((tx) => {
                const amount = parseFloat(tx.amount);
                const isCredit = amount > 0;
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{formatTime(tx.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isCredit ? "text-emerald-400" : "text-[var(--foreground)]"}`}>
                        {isCredit ? "+" : ""}¥{Math.abs(amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        余额 ¥{parseFloat(tx.balanceAfter).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

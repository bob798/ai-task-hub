"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  formatTxTime,
  getServerWalletSnapshot,
  getWalletSnapshot,
  recharge,
  RECHARGE_PRESETS,
  resetWallet,
  subscribeWallet,
} from "@/lib/wallet";

export default function WalletPage() {
  const wallet = useSyncExternalStore(
    subscribeWallet,
    getWalletSnapshot,
    getServerWalletSnapshot
  );
  const [selected, setSelected] = useState<number>(RECHARGE_PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [justRecharged, setJustRecharged] = useState<number | null>(null);

  const customAmount = parseFloat(custom);
  const amount = custom.trim() !== "" && customAmount > 0 ? customAmount : selected;

  const handleRecharge = () => {
    if (!amount || amount <= 0) return;
    recharge(amount);
    setJustRecharged(amount);
    setCustom("");
    setTimeout(() => setJustRecharged(null), 2500);
  };

  const handleReset = () => {
    if (window.confirm("确定要重置钱包吗？余额将恢复为初始试用额度，收支明细清空。")) {
      resetWallet();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <p className="mb-4 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400">
          我的账户
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          我的<span className="gradient-text">钱包</span>
        </h1>
      </section>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* 余额卡片 */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl p-8 text-white shadow-lg"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute top-0 right-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10" />
          <p className="text-sm text-white/80">当前余额</p>
          <p className="mt-2 text-5xl font-black tracking-tight">
            ¥{wallet.balance.toFixed(2)}
          </p>
          <p className="mt-3 text-xs text-white/70">
            余额长期有效，按次扣费，生成失败不扣费
          </p>
        </div>

        {/* 充值 */}
        <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">充值</h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RECHARGE_PRESETS.map((preset) => {
              const active = custom.trim() === "" && selected === preset;
              return (
                <button
                  key={preset}
                  onClick={() => {
                    setSelected(preset);
                    setCustom("");
                  }}
                  className={`rounded-xl border px-4 py-4 text-center transition ${
                    active
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-indigo-400/50"
                  }`}
                >
                  <span className="text-xl font-bold">¥{preset}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-[var(--muted)]">
              或输入自定义金额
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                step="1"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="自定义金额（元）"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleRecharge}
                disabled={!amount || amount <= 0}
                className="shrink-0 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--gradient-hero)" }}
              >
                充值 ¥{amount > 0 ? amount : 0}
              </button>
            </div>
          </div>

          {justRecharged !== null && (
            <p className="mt-3 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400 ring-1 ring-emerald-400/30">
              ✓ 充值成功，已到账 ¥{justRecharged.toFixed(2)}
            </p>
          )}
          <p className="mt-3 text-xs text-[var(--muted)]">
            * 演示环境：充值为模拟操作，不涉及真实支付。
          </p>
        </div>

        {/* 收支明细 */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">收支明细</h2>
            {wallet.transactions.length > 0 && (
              <button
                onClick={handleReset}
                className="text-xs text-[var(--muted)] transition-colors hover:text-red-400"
              >
                重置钱包
              </button>
            )}
          </div>

          {wallet.transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--muted)]">
                还没有收支记录。
                <Link href="/generate" className="ml-1 text-indigo-400 hover:opacity-80">
                  去生成第一个任务 →
                </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {tx.label}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {formatTxTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        tx.type === "recharge" ? "text-emerald-400" : "text-[var(--foreground)]"
                      }`}
                    >
                      {tx.type === "recharge" ? "+" : "−"}¥{tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      余额 ¥{tx.balanceAfter.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

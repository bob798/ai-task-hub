"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { RECHARGE_PACKAGES } from "@/lib/recharge-packages";

export default function TopupPage() {
  const [selectedId, setSelectedId] = useState(RECHARGE_PACKAGES[1].id);
  const [payMethod, setPayMethod] = useState<"stripe" | "alipay">("alipay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user/balance")
      .then((r) => r.json())
      .then((d) => setBalance(d.balance))
      .catch(() => {});
  }, []);

  const handleTopup = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = payMethod === "stripe" ? "/api/payment/stripe" : "/api/payment/alipay";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "创建支付失败");
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            账户<span className="gradient-text">充值</span>
          </h1>
          {balance !== null && (
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              当前余额：<span className="font-bold gradient-text">¥{balance.toFixed(2)}</span>
            </p>
          )}
        </div>

        {/* Package selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {RECHARGE_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedId(pkg.id)}
              className="relative rounded-2xl border p-6 text-left transition-all hover:-translate-y-0.5"
              style={{
                background: "var(--surface-elevated)",
                borderColor: selectedId === pkg.id ? "rgba(99,102,241,0.6)" : "var(--border)",
                boxShadow: selectedId === pkg.id ? "0 0 20px rgba(99,102,241,0.15)" : undefined,
              }}
            >
              {pkg.bonus > 0 && (
                <span className="absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: "var(--gradient-hero)" }}>
                  赠 ¥{pkg.bonus}
                </span>
              )}
              <p className="text-2xl font-black gradient-text">{pkg.label}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{pkg.description}</p>
            </button>
          ))}
        </div>

        {/* Payment method */}
        <div className="rounded-2xl border p-6 mb-6" style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}>
          <p className="text-sm font-medium mb-3" style={{ color: "var(--foreground)" }}>支付方式</p>
          <div className="flex gap-3">
            <button
              onClick={() => setPayMethod("alipay")}
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors"
              style={{
                borderColor: payMethod === "alipay" ? "rgba(99,102,241,0.6)" : "var(--border)",
                color: "var(--foreground)",
                background: payMethod === "alipay" ? "rgba(99,102,241,0.1)" : "var(--surface)",
              }}
            >
              支付宝
            </button>
            <button
              onClick={() => setPayMethod("stripe")}
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors"
              style={{
                borderColor: payMethod === "stripe" ? "rgba(99,102,241,0.6)" : "var(--border)",
                color: "var(--foreground)",
                background: payMethod === "stripe" ? "rgba(99,102,241,0.1)" : "var(--surface)",
              }}
            >
              Stripe（国际卡）
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleTopup}
          disabled={loading}
          className="w-full rounded-xl py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--gradient-hero)" }}
        >
          {loading ? "跳转支付中..." : "确认充值"}
        </button>

        <p className="mt-4 text-center text-xs" style={{ color: "var(--muted)" }}>
          <Link href="/wallet" style={{ color: "var(--primary)" }}>返回钱包</Link>
        </p>
      </div>
    </div>
  );
}

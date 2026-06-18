"use client";

import { useEffect, useState } from "react";

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inviteStats, setInviteStats] = useState<{
    count: number;
    totalRewards: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/user/invite-code")
      .then((r) => r.json())
      .then((d) => {
        if (d.inviteCode) setInviteCode(d.inviteCode);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/user/invite-stats")
      .then((r) => r.json())
      .then((d) => {
        if (d) setInviteStats(d);
      })
      .catch(() => {});
  }, []);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "";

  const inviteLink = inviteCode ? `${baseUrl}/register?invite=${inviteCode}` : "";

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = inviteLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <section className="relative overflow-hidden py-16 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <p className="mb-4 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400">
          邀请好友
        </p>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          邀请好友，<span className="gradient-text">共享奖励</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm" style={{ color: "var(--muted)" }}>
          每成功邀请一位好友注册，你获得 ¥2，好友额外获得 ¥1 试用余额
        </p>
      </section>

      <main className="mx-auto max-w-2xl px-4 pb-24 space-y-6">
        {/* Invite link card */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: "var(--surface-elevated)",
            borderColor: "var(--border)",
          }}
        >
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            你的专属邀请链接
          </h2>

          {loading ? (
            <div className="h-12 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
          ) : (
            <>
              <div
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-mono break-all"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                }}
              >
                <span className="flex-1 truncate">{inviteLink || "加载中..."}</span>
              </div>

              <button
                onClick={handleCopy}
                disabled={!inviteLink}
                className="mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--gradient-hero)" }}
              >
                {copied ? "已复制！" : "复制邀请链接"}
              </button>

              {inviteCode && (
                <p className="mt-3 text-center text-xs" style={{ color: "var(--muted)" }}>
                  邀请码：<span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{inviteCode}</span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Stats card */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: "var(--surface-elevated)",
            borderColor: "var(--border)",
          }}
        >
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            邀请统计
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface)" }}>
              <p className="text-3xl font-bold text-indigo-400">
                {inviteStats?.count ?? 0}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                已邀请好友
              </p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface)" }}>
              <p className="text-3xl font-bold text-emerald-400">
                ¥{(inviteStats?.totalRewards ?? 0).toFixed(2)}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                累计获得奖励
              </p>
            </div>
          </div>
        </div>

        {/* Rules card */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: "var(--surface-elevated)",
            borderColor: "var(--border)",
          }}
        >
          <h2 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            活动规则
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-400">•</span>
              好友通过你的邀请链接注册，即视为成功邀请
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-400">•</span>
              好友注册成功后，你将立即获得 ¥2 余额奖励
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-400">•</span>
              好友在标准 ¥1 注册赠送基础上，额外获得 ¥1 奖励
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-400">•</span>
              每个邀请码可无限次使用，邀请越多奖励越多
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

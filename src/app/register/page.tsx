"use client";

import Link from "next/link";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCodeFromUrl = searchParams.get("invite") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeCooldown, setCodeCooldown] = useState(0);

  useEffect(() => {
    if (codeCooldown <= 0) return;
    const timer = setTimeout(() => setCodeCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [codeCooldown]);

  const handleSendCode = useCallback(async () => {
    if (!email || codeCooldown > 0 || sendingCode) return;
    setError("");
    setSendingCode(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "发送验证码失败");
      } else {
        setCodeCooldown(60);
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSendingCode(false);
    }
  }, [email, codeCooldown, sendingCode]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("密码至少 8 个字符");
      return;
    }

    if (!verificationCode) {
      setError("请输入验证码");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email,
          password,
          verificationCode,
          inviteCode: inviteCodeFromUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            注册 <span className="gradient-text">AI Task Hub</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            创建账户，开始使用 AI 生成服务
          </p>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
        >
          {inviteCodeFromUrl && (
            <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              受邀注册，额外获得 ¥1 试用余额
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                昵称 <span style={{ color: "var(--muted)" }}>(可选)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                placeholder="你的昵称"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                验证码
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                  className="flex-1 rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                  placeholder="6 位验证码"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!email || codeCooldown > 0 || sendingCode}
                  className="shrink-0 rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                    color: "var(--primary)",
                  }}
                >
                  {sendingCode
                    ? "发送中..."
                    : codeCooldown > 0
                      ? `${codeCooldown}s`
                      : "发送验证码"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                placeholder="至少 8 个字符"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--gradient-hero)" }}
            >
              {loading ? "注册中..." : "创建账户"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
            已有账户？{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--primary)" }}>
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

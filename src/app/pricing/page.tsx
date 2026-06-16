import Link from "next/link";

const imageOptions = [
  { label: "标准质量 1024×1024", price: "¥0.5", unit: "张" },
  { label: "标准质量 其他尺寸", price: "¥0.7", unit: "张" },
  { label: "高清质量 1024×1024", price: "¥1.0", unit: "张" },
  { label: "高清质量 其他尺寸", price: "¥1.5", unit: "张" },
];

const faqs = [
  {
    q: "什么是按次计费？",
    a: "按次计费意味着您只需为实际使用的服务付费，每次成功生成图片或完成任务后，对应金额从余额中扣除，无需订阅月费。",
  },
  {
    q: "如何充值和付款？",
    a: "目前支持支付宝、微信支付等主流支付方式充值余额，充值后即可立即使用各项服务。",
  },
  {
    q: "是否提供 API 接口？",
    a: "是的，我们提供完整的 REST API，方便开发者将图片生成等能力集成到自己的产品中。API 计费与平台一致，均为按次收费。",
  },
  {
    q: "生成失败会扣费吗？",
    a: "不会。只有成功生成并返回结果的任务才会扣除费用，生成失败或超时的请求不收取任何费用。",
  },
  {
    q: "余额是否会过期？",
    a: "充值余额长期有效，不设过期时间，请放心使用。",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />
        <p className="mb-4 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400">
          定价方案
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          透明定价，
          <span className="gradient-text">按需付费</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted)]">
          无月费、无订阅，用多少付多少。所有价格含税，清晰透明，无任何隐藏收费。
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Image Generation Card */}
          <div className="relative col-span-full rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-8 shadow-lg lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl shadow-md">
                🖼️
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">图片生成</h2>
                <p className="text-sm text-[var(--muted)]">由 DALL·E 3 强力驱动</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {imageOptions.map((option) => (
                <div
                  key={option.label}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
                >
                  <span className="text-sm text-[var(--foreground)]">{option.label}</span>
                  <span className="ml-4 shrink-0 text-xl font-bold text-indigo-400">
                    {option.price}
                    <span className="text-sm font-normal text-[var(--muted)]">/{option.unit}</span>
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-[var(--muted)]">
              * 标准质量适合日常使用，高清质量提供更精细的细节，适合专业场景。
            </p>
          </div>

          {/* Code Generation Card */}
          <div className="relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl shadow-md">
                💻
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">代码生成</h2>
                <p className="text-sm text-[var(--muted)]">智能编程助手</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <span className="text-sm text-[var(--foreground)]">单次生成</span>
              <span className="ml-4 shrink-0 text-xl font-bold text-indigo-400">
                ¥0.2
                <span className="text-sm font-normal text-[var(--muted)]">/次</span>
              </span>
            </div>
            <p className="mt-5 text-xs text-[var(--muted)]">
              * 支持 TypeScript、Python、Go 等 8 种语言，生成失败不扣费。
            </p>
            <Link
              href="/code"
              className="mt-auto pt-4 text-sm font-semibold text-indigo-400 transition-opacity hover:opacity-70"
            >
              立即体验 →
            </Link>
          </div>

          {/* Document Processing Card */}
          <div className="relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-xl shadow-md">
                📄
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">文档处理</h2>
                <p className="text-sm text-[var(--muted)]">智能文档分析与摘要</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <span className="text-sm text-[var(--foreground)]">单次处理</span>
              <span className="ml-4 shrink-0 text-xl font-bold text-indigo-400">
                ¥0.3
                <span className="text-sm font-normal text-[var(--muted)]">/次</span>
              </span>
            </div>
            <p className="mt-5 text-xs text-[var(--muted)]">
              * 支持总结摘要、中英互译、要点分析，单次最长 8000 字符。
            </p>
            <Link
              href="/document"
              className="mt-auto pt-4 text-sm font-semibold text-indigo-400 transition-opacity hover:opacity-70"
            >
              立即体验 →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="mb-10 text-center text-3xl font-bold text-[var(--foreground)]">
          常见问题
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-5 transition-all"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-[var(--foreground)]">
                {faq.q}
                <span className="ml-4 shrink-0 text-indigo-400 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-28 text-center px-4">
        <div className="mx-auto max-w-xl rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 p-10">
          <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">准备好了吗？</h2>
          <p className="mb-8 text-[var(--muted)]">
            立即开始体验，首次注册赠送试用额度，无需信用卡。
          </p>
          <Link
            href="/generate"
            className="inline-block rounded-full px-8 py-3 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
            style={{ background: "var(--gradient-hero)" }}
          >
            免费开始生成
          </Link>
        </div>
      </section>
    </div>
  );
}

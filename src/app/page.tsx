import Link from "next/link";

const features = [
  {
    icon: "🎨",
    title: "AI 图片生成",
    description: "输入文字描述，秒速生成高质量图片。支持多种风格和分辨率，满足创意无限可能。",
    badge: "已上线",
    badgeColor: "#10b981",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    icon: "💻",
    title: "代码生成",
    description: "描述你的需求，AI 自动生成高质量代码。支持多种编程语言和框架。",
    badge: "已上线",
    badgeColor: "#10b981",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    icon: "📄",
    title: "文档处理",
    description: "智能分析、总结、翻译各类文档。让繁琐的文档工作变得轻而易举。",
    badge: "即将推出",
    badgeColor: "#f59e0b",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    icon: "💳",
    title: "按次透明计费",
    description: "无月费，无订阅。只为你实际使用的任务付费，成本完全可控。",
    badge: "灵活付费",
    badgeColor: "#6366f1",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
];

const useCases = [
  { icon: "✨", title: "设计师", desc: "快速生成概念图和灵感素材" },
  { icon: "🚀", title: "创业者", desc: "低成本获取专业级 AI 能力" },
  { icon: "📱", title: "内容创作者", desc: "批量生产高质量视觉内容" },
  { icon: "🛠️", title: "开发者", desc: "按需调用，无需复杂 API 集成" },
];

const pricingItems = [
  { name: "标准图片生成", desc: "512×512，30秒内生成", price: "¥0.5", unit: "/ 次" },
  { name: "高清图片生成", desc: "1024×1024，60秒内生成", price: "¥1.5", unit: "/ 次" },
  { name: "超高清图片生成", desc: "2048×2048，90秒内生成", price: "¥3.0", unit: "/ 次" },
];

export default function Home() {
  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-20 left-1/4 w-72 h-72 rounded-full -z-10 blur-3xl opacity-20"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div
          className="absolute top-40 right-1/4 w-96 h-96 rounded-full -z-10 blur-3xl opacity-15"
          style={{ background: "var(--gradient-cta)" }}
        />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              borderColor: "rgba(99, 102, 241, 0.3)",
              color: "var(--primary)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--primary)" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} />
            </span>
            图片生成已上线 · 按次计费，立即可用
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
            <span className="gradient-text">AI 驱动的</span>
            <br />
            任务完成平台
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            提交任务，AI 即刻完成。无需订阅，按次付费。
            <br className="hidden sm:block" />
            从图片生成开始，体验 AI 的无限可能。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: "var(--gradient-hero)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              开始创作
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:opacity-80 border"
              style={{
                color: "var(--foreground)",
                borderColor: "var(--border)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              查看定价
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-1.5">
              <span>✅</span> 无需注册即可试用
            </span>
            <span className="flex items-center gap-1.5">
              <span>⚡</span> 30 秒内生成
            </span>
            <span className="flex items-center gap-1.5">
              <span>🔒</span> 数据安全保障
            </span>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="py-24" style={{ background: "var(--surface)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              强大功能，<span className="gradient-text">一触即发</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
              我们正在构建全面的 AI 任务平台，从图片生成出发，逐步扩展到更多场景
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border"
                style={{
                  background: "var(--surface-elevated)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: feature.gradient, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                >
                  {feature.icon}
                </div>

                {/* Badge */}
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white mb-3"
                  style={{ background: feature.badgeColor }}
                >
                  {feature.badge}
                </span>

                <h3 className="text-base font-bold mb-2" style={{ color: "var(--foreground)" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Use Cases ===== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <span className="gradient-text">谁适合</span>使用 AI Task Hub？
              </h2>
              <p className="text-base mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
                无论你是个人创作者、小型团队还是企业用户，AI Task Hub
                都能按需为你提供强大的 AI 能力，无需技术背景，人人可用。
              </p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                立即体验图片生成
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right: Use case grid */}
            <div className="grid grid-cols-2 gap-4">
              {useCases.map((uc) => (
                <div
                  key={uc.title}
                  className="rounded-2xl p-5 border transition-all duration-200 hover:border-indigo-500/40"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="text-3xl mb-3">{uc.icon}</div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: "var(--foreground)" }}>
                    {uc.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {uc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Pricing Preview ===== */}
      <section className="py-24 relative overflow-hidden" style={{ background: "var(--surface)" }}>
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              简单透明的<span className="gradient-text">按次计费</span>
            </h2>
            <p className="text-base" style={{ color: "var(--muted)" }}>
              无月费，无隐藏收费。只为你真正用到的服务付费。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {pricingItems.map((item, idx) => (
              <div
                key={item.name}
                className="rounded-2xl p-6 border text-center relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: "var(--surface-elevated)",
                  borderColor: idx === 1 ? "rgba(99, 102, 241, 0.5)" : "var(--border)",
                  boxShadow: idx === 1 ? "0 0 30px rgba(99,102,241,0.15)" : undefined,
                }}
              >
                {idx === 1 && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--gradient-hero)" }}
                  >
                    推荐
                  </div>
                )}
                <h3 className="font-bold text-sm mb-1" style={{ color: "var(--foreground)" }}>
                  {item.name}
                </h3>
                <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                  {item.desc}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black gradient-text">{item.price}</span>
                  <span className="text-sm" style={{ color: "var(--muted)" }}>{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              查看完整定价方案
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: "var(--gradient-hero)" }}
          >
            {/* decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                准备好了吗？
              </h2>
              <p className="text-white/80 text-base mb-8 max-w-lg mx-auto">
                立即体验 AI 驱动的图片生成，无需注册，按次付费，随用随取。
              </p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ color: "#6366f1" }}
              >
                立即开始创作
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 — AI Task Hub",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 px-4" style={{ background: "var(--background)" }}>
      <article className="mx-auto max-w-3xl prose prose-invert">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--foreground)" }}>隐私政策</h1>
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          <p>最后更新日期：2026 年 6 月</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>1. 信息收集</h2>
          <p>我们收集以下信息以提供服务：账户信息（邮箱、昵称、头像）、使用记录（任务类型、时间、费用）、支付信息（由第三方支付平台处理，我们不存储支付卡号）。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>2. 信息使用</h2>
          <p>收集的信息仅用于：提供和改进服务、处理支付、发送服务通知、防止滥用和欺诈。我们不会向第三方出售您的个人信息。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>3. 数据存储与安全</h2>
          <p>您的数据存储在安全的服务器上，采用加密传输和存储。我们采取合理的技术和组织措施保护您的个人信息。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>4. AI 生成内容</h2>
          <p>您通过平台生成的内容（图片、代码、文档处理结果）属于您。我们不会将您的输入或生成结果用于训练 AI 模型。生成内容可能通过第三方 AI 服务（如 OpenAI）处理，请参阅其隐私政策。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>5. Cookie</h2>
          <p>我们使用必要的 Cookie 维持登录会话。不使用第三方跟踪 Cookie。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>6. 用户权利</h2>
          <p>您有权：访问您的个人数据、要求更正或删除数据、导出您的数据、撤回同意。请通过客服邮箱联系我们行使这些权利。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>7. 联系方式</h2>
          <p>如有隐私相关问题，请联系：xbb798@gmail.com</p>
        </div>
      </article>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款 — AI Task Hub",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20 px-4" style={{ background: "var(--background)" }}>
      <article className="mx-auto max-w-3xl prose prose-invert">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--foreground)" }}>服务条款</h1>
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          <p>最后更新日期：2026 年 6 月</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>1. 服务描述</h2>
          <p>AI Task Hub 提供基于人工智能的任务完成服务，包括但不限于图片生成、代码生成和文档处理。服务按次计费，用户需先充值余额后使用。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>2. 账户</h2>
          <p>您需要注册账户才能使用付费服务。您有责任保管账户安全，不得共享账户凭证。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>3. 计费与退款</h2>
          <p>服务按次计费，费用从账户余额中扣除。生成失败的任务不收取费用，已扣金额将自动退回余额。充值余额长期有效，不设过期时间。充值后一般不支持退款，特殊情况请联系客服。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>4. 使用规范</h2>
          <p>您不得使用本服务生成违法、侵权、色情、暴力或其他违反法律法规的内容。我们保留拒绝处理违规请求的权利。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>5. 知识产权</h2>
          <p>您通过平台生成的内容归您所有，但您应确保输入内容不侵犯他人知识产权。平台本身的设计、代码、商标等知识产权归 AI Task Hub 所有。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>6. 免责声明</h2>
          <p>AI 生成内容可能存在不准确或不完整的情况，我们不对生成内容的准确性、完整性或适用性作出保证。用户应自行判断和验证生成内容。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>7. 服务变更</h2>
          <p>我们可能随时修改服务内容和定价，重大变更将提前通知。</p>

          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>8. 联系方式</h2>
          <p>如有问题，请联系：xbb798@gmail.com</p>
        </div>
      </article>
    </div>
  );
}

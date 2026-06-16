import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { chatComplete } from "@/lib/openai";
import { DOC_PRICE } from "@/lib/pricing";
import { DOC_MAX_LENGTH, DOC_MODES, type DocMode } from "@/lib/document";
import { deductBalance, addBalance } from "@/lib/balance";
import { createTask, updateTaskStatus } from "@/lib/tasks";

const MODE_PROMPTS: Record<DocMode, string> = {
  summarize:
    "你是专业的文档编辑。请对用户提供的文本进行总结，输出一段简洁准确的摘要，保留关键信息，不超过原文的四分之一长度。",
  "translate-zh":
    "你是专业翻译。请将用户提供的文本翻译成流畅自然的简体中文，保持原意与语气，只输出译文。",
  "translate-en":
    "你是专业翻译。请将用户提供的文本翻译成流畅自然的英文，保持原意与语气，只输出译文。",
  analyze:
    "你是资深分析师。请分析用户提供的文本，以要点列表形式输出核心观点、关键数据与值得注意的细节。",
};

function getMockResult(modeLabel: string, text: string): string {
  return [
    `【演示模式】未配置 OPENAI_API_KEY`,
    `处理类型：${modeLabel}`,
    `原文长度：${text.length} 字符`,
    `原文开头：${text.slice(0, 60)}${text.length > 60 ? "…" : ""}`,
    `配置 API Key 后将返回真实处理结果。`,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { text, mode } = body as { text?: unknown; mode?: unknown };

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "请输入要处理的文本" }, { status: 400 });
  }
  if (text.trim().length > DOC_MAX_LENGTH) {
    return NextResponse.json({ error: `文本不能超过 ${DOC_MAX_LENGTH} 个字符` }, { status: 400 });
  }

  const resolvedMode: DocMode = DOC_MODES.some((m) => m.key === mode)
    ? (mode as DocMode)
    : "summarize";
  const modeLabel = DOC_MODES.find((m) => m.key === resolvedMode)!.label;

  // Deduct balance
  const deductResult = await deductBalance(userId, DOC_PRICE, `文档处理 ${modeLabel}`);
  if (!deductResult.success) {
    return NextResponse.json(
      { error: `余额不足，当前余额 ¥${deductResult.currentBalance.toFixed(2)}，需要 ¥${DOC_PRICE.toFixed(2)}`, code: "INSUFFICIENT_BALANCE" },
      { status: 402 }
    );
  }

  const task = await createTask({
    userId,
    type: "document_processing",
    prompt: text.trim().slice(0, 200),
    params: { mode: resolvedMode, textLength: text.trim().length },
    cost: DOC_PRICE,
  });

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const result = getMockResult(modeLabel, text.trim());
    await updateTaskStatus(task.id, "COMPLETED", { result });
    return NextResponse.json({ result, cost: DOC_PRICE, mock: true, taskId: task.id, newBalance: deductResult.newBalance });
  }

  try {
    const completion = await chatComplete(apiKey, {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: MODE_PROMPTS[resolvedMode] },
        { role: "user", content: text.trim() },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content?.trim();
    if (!result) {
      await addBalance(userId, DOC_PRICE, "文档处理失败退款", { type: "REFUND" });
      await updateTaskStatus(task.id, "FAILED", undefined, "处理结果为空");
      return NextResponse.json({ error: "处理结果为空，请稍后重试" }, { status: 500 });
    }

    await updateTaskStatus(task.id, "COMPLETED", { result });
    return NextResponse.json({ result, cost: DOC_PRICE, mock: false, taskId: task.id, newBalance: deductResult.newBalance });
  } catch (err) {
    const message = err instanceof Error ? err.message : "文档处理失败，请稍后重试";
    await addBalance(userId, DOC_PRICE, "文档处理失败退款", { type: "REFUND" });
    await updateTaskStatus(task.id, "FAILED", undefined, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

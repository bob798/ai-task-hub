import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { chatComplete } from "@/lib/openai";
import { CODE_PRICE } from "@/lib/pricing";
import { LANGUAGES } from "@/lib/code";
import { deductBalance, addBalance } from "@/lib/balance";
import { createTask, updateTaskStatus } from "@/lib/tasks";

const SYSTEM_PROMPT =
  "你是一名资深软件工程师。根据用户需求生成高质量、可直接运行的代码。" +
  "只输出一个 Markdown 代码块（含语言标注），代码内可包含必要的注释，代码块外不要输出任何解释文字。";

function getMockCode(language: string, prompt: string): string {
  return [
    "```" + language.toLowerCase(),
    `// 演示模式：未配置 OPENAI_API_KEY`,
    `// 需求：${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}`,
    `function helloAiTaskHub() {`,
    `  console.log("配置 API Key 后将返回真实 ${language} 代码");`,
    `}`,
    "```",
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

  const { prompt, language } = body as { prompt?: unknown; language?: unknown };

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "请输入代码需求描述" }, { status: 400 });
  }
  if (prompt.trim().length > 4000) {
    return NextResponse.json({ error: "描述文字不能超过 4000 个字符" }, { status: 400 });
  }

  const resolvedLanguage = LANGUAGES.includes(language as (typeof LANGUAGES)[number])
    ? (language as string)
    : "TypeScript";

  // Deduct balance
  const deductResult = await deductBalance(userId, CODE_PRICE, `代码生成 ${resolvedLanguage}`);
  if (!deductResult.success) {
    return NextResponse.json(
      { error: `余额不足，当前余额 ¥${deductResult.currentBalance.toFixed(2)}，需要 ¥${CODE_PRICE.toFixed(2)}`, code: "INSUFFICIENT_BALANCE" },
      { status: 402 }
    );
  }

  const task = await createTask({
    userId,
    type: "code_generation",
    prompt: prompt.trim(),
    params: { language: resolvedLanguage },
    cost: CODE_PRICE,
  });

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const code = getMockCode(resolvedLanguage, prompt.trim());
    await updateTaskStatus(task.id, "COMPLETED", { code });
    return NextResponse.json({ code, cost: CODE_PRICE, mock: true, taskId: task.id, newBalance: deductResult.newBalance });
  }

  try {
    const result = await chatComplete(apiKey, {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `使用 ${resolvedLanguage} 实现以下需求：\n\n${prompt.trim()}` },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    });

    const code = result.choices[0]?.message?.content?.trim();
    if (!code) {
      await addBalance(userId, CODE_PRICE, "代码生成失败退款", { type: "REFUND" });
      await updateTaskStatus(task.id, "FAILED", undefined, "生成结果为空");
      return NextResponse.json({ error: "生成结果为空，请稍后重试" }, { status: 500 });
    }

    await updateTaskStatus(task.id, "COMPLETED", { code });
    return NextResponse.json({ code, cost: CODE_PRICE, mock: false, taskId: task.id, newBalance: deductResult.newBalance });
  } catch (err) {
    const message = err instanceof Error ? err.message : "代码生成失败，请稍后重试";
    await addBalance(userId, CODE_PRICE, "代码生成失败退款", { type: "REFUND" });
    await updateTaskStatus(task.id, "FAILED", undefined, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

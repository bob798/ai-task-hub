import { NextRequest, NextResponse } from "next/server";
import { chatComplete } from "@/lib/openai";
import { CODE_PRICE } from "@/lib/pricing";
import { LANGUAGES } from "@/lib/code";

const SYSTEM_PROMPT =
  "你是一名资深软件工程师。根据用户需求生成高质量、可直接运行的代码。" +
  "只输出一个 Markdown 代码块（含语言标注），代码内可包含必要的注释，代码块外不要输出任何解释文字。";

// 模拟代码（无 API Key 时用于开发测试）
function getMockCode(language: string, prompt: string): string {
  return [
    "```" + language.toLowerCase(),
    `// 演示模式：未配置 OPENAI_API_KEY，以下为示例输出`,
    `// 需求：${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}`,
    `function helloAiTaskHub() {`,
    `  console.log("配置 API Key 后，这里将返回真实生成的 ${language} 代码");`,
    `}`,
    "```",
  ].join("\n");
}

export async function POST(request: NextRequest) {
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

  const apiKey = process.env.OPENAI_API_KEY;

  // 无 API Key 时返回模拟数据
  if (!apiKey) {
    return NextResponse.json({
      code: getMockCode(resolvedLanguage, prompt.trim()),
      cost: CODE_PRICE,
      mock: true,
    });
  }

  try {
    const result = await chatComplete(apiKey, {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `使用 ${resolvedLanguage} 实现以下需求：\n\n${prompt.trim()}`,
        },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    });

    const code = result.choices[0]?.message?.content?.trim();
    if (!code) {
      return NextResponse.json({ error: "生成结果为空，请稍后重试" }, { status: 500 });
    }

    return NextResponse.json({ code, cost: CODE_PRICE, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "代码生成失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

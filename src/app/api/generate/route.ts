import { NextRequest, NextResponse } from "next/server";
import { generateImages } from "@/lib/openai";
import { calculateTotalCost, type ImageQuality, type ImageSize } from "@/lib/pricing";

const VALID_SIZES: ImageSize[] = ["1024x1024", "1024x1792", "1792x1024"];
const VALID_QUALITIES: ImageQuality[] = ["standard", "hd"];

// 模拟图片（无 API Key 时用于开发测试）
function getMockImages(n: number): string[] {
  return Array.from(
    { length: n },
    (_, i) =>
      `https://placehold.co/1024x1024/6366f1/ffffff?text=AI+生成图片+${i + 1}`
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { prompt, size, quality, n } = body as {
    prompt?: unknown;
    size?: unknown;
    quality?: unknown;
    n?: unknown;
  };

  // 输入验证
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "请输入图片描述" }, { status: 400 });
  }
  if (prompt.trim().length > 4000) {
    return NextResponse.json({ error: "描述文字不能超过 4000 个字符" }, { status: 400 });
  }

  const resolvedSize: ImageSize =
    VALID_SIZES.includes(size as ImageSize) ? (size as ImageSize) : "1024x1024";

  const resolvedQuality: ImageQuality =
    VALID_QUALITIES.includes(quality as ImageQuality) ? (quality as ImageQuality) : "standard";

  const count = typeof n === "number" && n >= 1 && n <= 4 ? Math.floor(n) : 1;

  const totalCost = calculateTotalCost(resolvedQuality, resolvedSize, count);

  const apiKey = process.env.OPENAI_API_KEY;

  // 无 API Key 时返回模拟数据
  if (!apiKey) {
    const mockUrls = getMockImages(count);
    return NextResponse.json({
      images: mockUrls.map((url) => ({ url })),
      cost: totalCost,
      mock: true,
    });
  }

  try {
    const result = await generateImages(apiKey, {
      model: "gpt-image-1",
      prompt: prompt.trim(),
      n: count,
      size: resolvedSize,
      quality: resolvedQuality,
      response_format: "url",
    });

    return NextResponse.json({
      images: result.data,
      cost: totalCost,
      mock: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "图片生成失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

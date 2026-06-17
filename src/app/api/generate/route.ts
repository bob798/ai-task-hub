import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateImages } from "@/lib/openai";
import { calculateTotalCost, type ImageQuality, type ImageSize } from "@/lib/pricing";
import { deductBalance, addBalance } from "@/lib/balance";
import { createTask, updateTaskStatus } from "@/lib/tasks";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_SIZES: ImageSize[] = ["1024x1024", "1024x1792", "1792x1024"];
const VALID_QUALITIES: ImageQuality[] = ["standard", "hd"];

function getMockImages(n: number): string[] {
  return Array.from(
    { length: n },
    (_, i) =>
      `https://placehold.co/1024x1024/6366f1/ffffff?text=AI+Image+${i + 1}`
  );
}

export async function POST(request: NextRequest) {
  // Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  // Rate limit
  const rateCheck = checkRateLimit(userId, "generate");
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `请求过于频繁，请 ${rateCheck.retryAfter} 秒后重试` },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } }
    );
  }

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

  // Deduct balance
  const deductResult = await deductBalance(
    userId,
    totalCost,
    `图片生成 ${resolvedQuality === "hd" ? "高清" : "标准"} ${resolvedSize} × ${count}`
  );

  if (!deductResult.success) {
    return NextResponse.json(
      {
        error: `余额不足，当前余额 ¥${deductResult.currentBalance.toFixed(2)}，需要 ¥${totalCost.toFixed(2)}`,
        code: "INSUFFICIENT_BALANCE",
        currentBalance: deductResult.currentBalance,
        required: totalCost,
      },
      { status: 402 }
    );
  }

  // Create task record
  const task = await createTask({
    userId,
    type: "image_generation",
    prompt: prompt.trim(),
    params: { size: resolvedSize, quality: resolvedQuality, count },
    cost: totalCost,
  });

  const apiKey = process.env.OPENAI_API_KEY;

  // Mock mode (no API key)
  if (!apiKey) {
    const mockUrls = getMockImages(count);
    await updateTaskStatus(task.id, "COMPLETED", { images: mockUrls.map((url) => ({ url })) });
    return NextResponse.json({
      images: mockUrls.map((url) => ({ url })),
      cost: totalCost,
      mock: true,
      taskId: task.id,
      newBalance: deductResult.newBalance,
    });
  }

  try {
    const results = await Promise.all(
      Array.from({ length: count }, () =>
        generateImages(apiKey, {
          model: "dall-e-3",
          prompt: prompt.trim(),
          n: 1,
          size: resolvedSize,
          quality: resolvedQuality,
          response_format: "url",
        })
      )
    );

    const images = results.flatMap((r) => r.data);
    await updateTaskStatus(task.id, "COMPLETED", JSON.parse(JSON.stringify({ images })));

    return NextResponse.json({
      images,
      cost: totalCost,
      mock: false,
      taskId: task.id,
      newBalance: deductResult.newBalance,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "图片生成失败，请稍后重试";

    // Refund on failure
    try {
      await addBalance(userId, totalCost, `图片生成失败退款`, { type: "REFUND" });
    } catch (refundErr) {
      console.error(`[REFUND_FAILED] userId=${userId} taskId=${task.id} amount=${totalCost}`, refundErr);
    }
    await updateTaskStatus(task.id, "FAILED", undefined, message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

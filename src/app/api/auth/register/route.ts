import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeName } from "@/lib/sanitize";

const SIGNUP_BONUS = 1.0;

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = checkRateLimit(ip, "register");
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `注册请求过于频繁，请 ${rateCheck.retryAfter} 秒后重试` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "密码至少 8 个字符" }, { status: 400 });
  }

  const sanitizedName = name ? sanitizeName(name) : null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: sanitizedName,
      email,
      passwordHash,
      balance: SIGNUP_BONUS,
    },
  });

  if (SIGNUP_BONUS > 0) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "GIFT",
        amount: SIGNUP_BONUS,
        balanceBefore: 0,
        balanceAfter: SIGNUP_BONUS,
        description: "注册赠送试用额度",
        status: "COMPLETED",
      },
    });
  }

  return NextResponse.json({ success: true, userId: user.id });
}

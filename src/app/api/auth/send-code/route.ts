import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// In-memory rate limit: max 3 codes per email per hour
const sendRateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SENDS = 3;

function checkSendRateLimit(email: string): {
  allowed: boolean;
  retryAfter: number;
} {
  const now = Date.now();
  const entry = sendRateMap.get(email);

  if (!entry || now > entry.resetAt) {
    sendRateMap.set(email, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= MAX_SENDS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { email } = body as { email?: string };

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "请填写邮箱" }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
  }

  // Rate limit
  const rateCheck = checkSendRateLimit(email);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `发送过于频繁，请 ${rateCheck.retryAfter} 秒后重试` },
      { status: 429 }
    );
  }

  // Check if email already registered
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing codes for this email
  await prisma.verificationCode.deleteMany({ where: { email } });

  // Store new code
  await prisma.verificationCode.create({
    data: { email, code, expiresAt },
  });

  // Log the code (production would send via email)
  console.log(`[VERIFICATION_CODE] email=${email} code=${code}`);

  return NextResponse.json({ success: true });
}

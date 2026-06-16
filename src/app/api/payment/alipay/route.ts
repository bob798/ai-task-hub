import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAlipayPageUrl } from "@/lib/alipay";
import { getPackageById } from "@/lib/recharge-packages";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { packageId } = body as { packageId?: string };
  if (!packageId) {
    return NextResponse.json({ error: "请选择充值套餐" }, { status: 400 });
  }

  const pkg = getPackageById(packageId);
  if (!pkg) {
    return NextResponse.json({ error: "无效的充值套餐" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Create a pending transaction for tracking
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { balance: true },
  });

  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: "TOPUP",
      amount: pkg.amount + pkg.bonus,
      balanceBefore: user.balance,
      balanceAfter: user.balance, // will be updated on callback
      description: `支付宝充值 ¥${pkg.amount}${pkg.bonus > 0 ? ` + 赠送 ¥${pkg.bonus}` : ""}`,
      paymentMethod: "alipay",
      externalId: null,
      status: "PENDING",
    },
  });

  try {
    const url = await createAlipayPageUrl({
      outTradeNo: transaction.id,
      totalAmount: pkg.amount.toFixed(2),
      subject: `AI Task Hub 充值 ¥${pkg.amount}`,
      returnUrl: `${baseUrl}/account/topup/callback`,
      notifyUrl: `${baseUrl}/api/webhooks/alipay`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED" },
    });
    const message = err instanceof Error ? err.message : "创建支付页面失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

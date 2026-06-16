import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { getPackageById } from "@/lib/recharge-packages";

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

  try {
    const checkoutSession = await createCheckoutSession(
      session.user.id,
      pkg.id,
      pkg.amount,
      pkg.bonus
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "创建支付会话失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const [count, rewardResult] = await Promise.all([
    prisma.user.count({
      where: { invitedBy: session.user.id },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: "GIFT",
        description: "邀请奖励",
        status: "COMPLETED",
      },
      _sum: { amount: true },
    }),
  ]);

  const totalRewards = (rewardResult._sum.amount as Prisma.Decimal | null)
    ?.toNumber() ?? 0;

  return NextResponse.json({ count, totalRewards });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    select: { id: true, userId: true, shareToken: true },
  });

  if (!task) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  if (task.userId !== session.user.id) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  // Reuse existing token or generate a new one
  const shareToken = task.shareToken ?? crypto.randomUUID().replace(/-/g, "");

  if (!task.shareToken) {
    await prisma.task.update({
      where: { id },
      data: { shareToken },
    });
  }

  return NextResponse.json({ shareUrl: `/s/${shareToken}` });
}

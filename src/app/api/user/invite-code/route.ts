import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { inviteCode: true },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  // Generate invite code if not set (fallback: schema default may not have run)
  if (!user.inviteCode) {
    // Use a short alphanumeric code derived from a UUID
    const inviteCode = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { inviteCode },
    });
    return NextResponse.json({ inviteCode });
  }

  return NextResponse.json({ inviteCode: user.inviteCode });
}

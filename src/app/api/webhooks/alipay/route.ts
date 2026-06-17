import { NextRequest, NextResponse } from "next/server";
import { getAlipay } from "@/lib/alipay";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  const alipay = getAlipay();
  const isValid = alipay.checkNotifySign(params);
  if (!isValid) {
    return new NextResponse("fail", { status: 400 });
  }

  const tradeStatus = params.trade_status;
  const outTradeNo = params.out_trade_no;
  const tradeNo = params.trade_no;

  if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") {
    await prisma.$transaction(async (tx) => {
      // Optimistic lock: only update if still PENDING
      const updated = await tx.transaction.updateMany({
        where: { id: outTradeNo, status: "PENDING" },
        data: { status: "COMPLETED", externalId: tradeNo },
      });

      // If no rows updated, already processed — skip (idempotent)
      if (updated.count === 0) return;

      const transaction = await tx.transaction.findUniqueOrThrow({
        where: { id: outTradeNo },
      });

      const user = await tx.user.findUniqueOrThrow({
        where: { id: transaction.userId },
        select: { balance: true },
      });

      const newBalance = user.balance.plus(transaction.amount);

      await tx.user.update({
        where: { id: transaction.userId },
        data: { balance: newBalance },
      });

      // Update balanceAfter on the transaction
      await tx.transaction.update({
        where: { id: outTradeNo },
        data: { balanceAfter: newBalance },
      });
    }, { isolationLevel: "Serializable" });
  }

  return new NextResponse("success", { status: 200 });
}

import { NextRequest, NextResponse } from "next/server";
import { getAlipay } from "@/lib/alipay";
import { prisma } from "@/lib/db";
import { addBalance } from "@/lib/balance";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  // Verify signature
  const alipay = getAlipay();
  const isValid = alipay.checkNotifySign(params);
  if (!isValid) {
    return new NextResponse("fail", { status: 400 });
  }

  const tradeStatus = params.trade_status;
  const outTradeNo = params.out_trade_no; // our transaction ID
  const tradeNo = params.trade_no; // alipay trade number

  if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") {
    // Find pending transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: outTradeNo },
    });

    if (transaction && transaction.status === "PENDING") {
      // Credit balance
      await addBalance(
        transaction.userId,
        transaction.amount.toNumber(),
        transaction.description || "支付宝充值",
        {
          type: "TOPUP",
          paymentMethod: "alipay",
          externalId: tradeNo,
        }
      );

      // Mark original pending transaction as completed
      await prisma.transaction.update({
        where: { id: outTradeNo },
        data: { status: "COMPLETED", externalId: tradeNo },
      });
    }
  }

  return new NextResponse("success", { status: 200 });
}

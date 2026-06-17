import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, amount, bonus } = session.metadata || {};

    if (userId && amount) {
      const totalCredit = parseFloat(amount) + parseFloat(bonus || "0");
      const description = `Stripe 充值 ¥${amount}${bonus && parseFloat(bonus) > 0 ? ` + 赠送 ¥${bonus}` : ""}`;

      await prisma.$transaction(async (tx) => {
        // Idempotency: check if this session.id already processed
        const existing = await tx.transaction.findUnique({
          where: { externalId: session.id },
        });
        if (existing) return; // Already processed

        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { balance: true },
        });

        const newBalance = user.balance.plus(totalCredit);

        await tx.user.update({
          where: { id: userId },
          data: { balance: newBalance },
        });

        await tx.transaction.create({
          data: {
            userId,
            type: "TOPUP",
            amount: totalCredit,
            balanceBefore: user.balance,
            balanceAfter: newBalance,
            description,
            paymentMethod: "stripe",
            externalId: session.id,
            status: "COMPLETED",
          },
        });
      }, { isolationLevel: "Serializable" });
    }
  }

  return NextResponse.json({ received: true });
}

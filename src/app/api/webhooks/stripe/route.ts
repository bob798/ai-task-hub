import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { addBalance } from "@/lib/balance";

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

      await addBalance(userId, totalCredit, `Stripe 充值 ¥${amount}${bonus && parseFloat(bonus) > 0 ? ` + 赠送 ¥${bonus}` : ""}`, {
        type: "TOPUP",
        paymentMethod: "stripe",
        externalId: session.id,
      });
    }
  }

  return NextResponse.json({ received: true });
}

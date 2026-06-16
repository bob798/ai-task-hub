import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return stripeInstance;
}

export async function createCheckoutSession(
  userId: string,
  packageId: string,
  amount: number,
  bonus: number
) {
  const stripe = getStripe();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "cny",
          product_data: {
            name: `AI Task Hub 充值 ¥${amount}${bonus > 0 ? ` (赠 ¥${bonus})` : ""}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: { userId, packageId, amount: String(amount), bonus: String(bonus) },
    success_url: `${baseUrl}/account/topup/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/account/topup`,
  });

  return session;
}

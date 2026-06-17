import { prisma } from "./db";
import { Prisma } from "@/generated/prisma/client";

type DeductResult =
  | { success: true; newBalance: number }
  | { success: false; error: "INSUFFICIENT_BALANCE"; currentBalance: number };

export async function deductBalance(
  userId: string,
  amount: number,
  description: string
): Promise<DeductResult> {
  const amt = new Prisma.Decimal(amount);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { balance: true },
    });

    if (user.balance.lessThan(amt)) {
      return {
        success: false as const,
        error: "INSUFFICIENT_BALANCE" as const,
        currentBalance: user.balance.toNumber(),
      };
    }

    const newBalance = user.balance.minus(amt);

    await tx.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: "DEDUCTION",
        amount: amt.negated(),
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        description,
        status: "COMPLETED",
      },
    });

    return { success: true as const, newBalance: newBalance.toNumber() };
  }, { isolationLevel: "Serializable" });
}

export async function addBalance(
  userId: string,
  amount: number,
  description: string,
  options?: {
    type?: "TOPUP" | "REFUND" | "GIFT";
    paymentMethod?: string;
    externalId?: string;
  }
): Promise<{ newBalance: number }> {
  const amt = new Prisma.Decimal(amount);
  const type = options?.type ?? "TOPUP";

  return prisma.$transaction(async (tx) => {
    // Idempotency check for external payments
    if (options?.externalId) {
      const existing = await tx.transaction.findFirst({
        where: { externalId: options.externalId, status: "COMPLETED" },
      });
      if (existing) {
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { balance: true },
        });
        return { newBalance: user.balance.toNumber() };
      }
    }

    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { balance: true },
    });

    const newBalance = user.balance.plus(amt);

    await tx.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    await tx.transaction.create({
      data: {
        userId,
        type,
        amount: amt,
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        description,
        paymentMethod: options?.paymentMethod,
        externalId: options?.externalId,
        status: "COMPLETED",
      },
    });

    return { newBalance: newBalance.toNumber() };
  }, { isolationLevel: "Serializable" });
}

export async function getBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });
  if (!user) return 0;
  return user.balance.toNumber();
}

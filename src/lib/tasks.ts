import { prisma } from "./db";
import { Prisma, type TaskStatus } from "@/generated/prisma/client";

export interface CreateTaskInput {
  userId: string;
  type: string;
  prompt: string;
  params?: Prisma.InputJsonValue;
  cost: number;
}

export async function createTask(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      userId: input.userId,
      type: input.type,
      prompt: input.prompt,
      params: input.params ?? Prisma.JsonNull,
      cost: input.cost,
      status: "PENDING",
    },
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  result?: Prisma.InputJsonValue,
  errorMsg?: string
) {
  return prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      result: result ?? undefined,
      errorMsg: errorMsg ?? undefined,
    },
  });
}

export async function getUserTasks(
  userId: string,
  page: number = 1,
  pageSize: number = 20
) {
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.task.count({ where: { userId } }),
  ]);

  return { tasks, total, totalPages: Math.ceil(total / pageSize) };
}

export function formatTaskTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return String(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

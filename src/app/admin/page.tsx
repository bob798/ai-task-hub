import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    redirect("/");
  }

  // Fetch stats
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalTasks, activeUsers, revenueResult, recentTransactions, recentTasks] =
    await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.user.count({
        where: {
          tasks: { some: { createdAt: { gte: sevenDaysAgo } } },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: "TOPUP", status: "COMPLETED" },
      }),
      prisma.transaction.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.task.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      }),
    ]);

  const totalRevenue = Number(revenueResult._sum.amount ?? 0);

  const stats = [
    { label: "总用户数", value: totalUsers },
    { label: "总收入", value: `¥${totalRevenue.toFixed(2)}` },
    { label: "总任务数", value: totalTasks },
    { label: "活跃用户 (7天)", value: activeUsers },
  ];

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--foreground)" }}>
          管理后台
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border p-6"
              style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
            >
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            最近交易
          </h2>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>用户</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>类型</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>金额</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>状态</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                        {tx.user.name || tx.user.email || "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                        {tx.type}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                        ¥{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                        {tx.status}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                        {tx.createdAt.toLocaleString("zh-CN")}
                      </td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center" style={{ color: "var(--muted)" }}>
                        暂无交易记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Recent Tasks */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            最近任务
          </h2>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>用户</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>类型</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>提示词</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>费用</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>状态</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr
                      key={task.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                        {task.user.name || task.user.email || "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                        {task.type}
                      </td>
                      <td
                        className="px-4 py-3 max-w-[200px] truncate"
                        style={{ color: "var(--foreground)" }}
                        title={task.prompt}
                      >
                        {task.prompt}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                        ¥{Number(task.cost).toFixed(2)}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                        {task.status}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                        {task.createdAt.toLocaleString("zh-CN")}
                      </td>
                    </tr>
                  ))}
                  {recentTasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center" style={{ color: "var(--muted)" }}>
                        暂无任务记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

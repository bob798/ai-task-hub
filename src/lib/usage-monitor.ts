const DAILY_LIMIT = parseFloat(process.env.DAILY_COST_LIMIT || "100");

let dailyTotal = 0;
let lastResetDate = "";

export function trackUsage(cost: number): { alert: boolean; total: number } {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== lastResetDate) {
    dailyTotal = 0;
    lastResetDate = today;
  }
  dailyTotal += cost;
  const alert = dailyTotal > DAILY_LIMIT;
  if (alert) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "warn",
      message: `Daily API cost limit exceeded: ¥${dailyTotal.toFixed(2)} > ¥${DAILY_LIMIT}`,
      dailyTotal,
      limit: DAILY_LIMIT,
    }));
  }
  return { alert, total: dailyTotal };
}

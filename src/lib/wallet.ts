// 客户端钱包：余额与充值/扣费记录，保存在 localStorage。
// 与任务历史一致采用 useSyncExternalStore 适配，便于多组件实时同步。

export interface WalletTransaction {
  id: string;
  type: "recharge" | "deduct";
  amount: number;
  /** 摘要，如「充值」或「图片生成」 */
  label: string;
  createdAt: string;
  /** 此笔之后的余额 */
  balanceAfter: number;
}

interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
}

const STORAGE_KEY = "ai-task-hub:wallet";
const MAX_TX = 100;
/** 新用户赠送的试用额度 */
export const INITIAL_BALANCE = 10;
export const RECHARGE_PRESETS = [10, 50, 100, 200];

const EMPTY_STATE: WalletState = { balance: INITIAL_BALANCE, transactions: [] };

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readState(): WalletState {
  if (!isBrowser()) return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { balance: INITIAL_BALANCE, transactions: [] };
    const parsed = JSON.parse(raw) as Partial<WalletState>;
    return {
      balance: typeof parsed.balance === "number" ? parsed.balance : INITIAL_BALANCE,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    };
  } catch {
    return { balance: INITIAL_BALANCE, transactions: [] };
  }
}

function writeState(state: WalletState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    notify();
  } catch {
    // 忽略存储错误
  }
}

// ---- useSyncExternalStore 适配 ----

let snapshot: WalletState | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  snapshot = null;
  listeners.forEach((listener) => listener());
}

export function subscribeWallet(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWalletSnapshot(): WalletState {
  if (snapshot === null) snapshot = readState();
  return snapshot;
}

export function getServerWalletSnapshot(): WalletState {
  return EMPTY_STATE;
}

// ---- 操作 ----

/** 四舍五入到分，避免浮点误差累积 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function makeTx(
  type: WalletTransaction["type"],
  amount: number,
  label: string,
  balanceAfter: number
): WalletTransaction {
  return {
    id: `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    type,
    amount: round2(amount),
    label,
    createdAt: new Date().toISOString(),
    balanceAfter: round2(balanceAfter),
  };
}

export function recharge(amount: number): void {
  if (!isBrowser() || amount <= 0) return;
  const state = readState();
  const balance = round2(state.balance + amount);
  const tx = makeTx("recharge", amount, "充值", balance);
  writeState({
    balance,
    transactions: [tx, ...state.transactions].slice(0, MAX_TX),
  });
}

/** 余额是否足以支付给定金额 */
export function canAfford(amount: number): boolean {
  return getWalletSnapshot().balance + 1e-9 >= amount;
}

/**
 * 扣费。余额不足返回 false 且不改动状态；成功返回 true。
 */
export function deduct(amount: number, label: string): boolean {
  if (!isBrowser() || amount <= 0) return true;
  const state = readState();
  if (state.balance + 1e-9 < amount) return false;
  const balance = round2(state.balance - amount);
  const tx = makeTx("deduct", amount, label, balance);
  writeState({
    balance,
    transactions: [tx, ...state.transactions].slice(0, MAX_TX),
  });
  return true;
}

export function resetWallet(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notify();
  } catch {
    // 忽略
  }
}

export function formatTxTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

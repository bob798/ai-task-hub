export type TaskStatus = "completed" | "failed";

export interface TaskRecord {
  id: string;
  type: string;
  status: TaskStatus;
  createdAt: string;
  cost: number;
  prompt: string;
  /** 任务参数摘要，如「高清质量 1024×1024 × 2 张」或「TypeScript」 */
  detail: string;
  mock: boolean;
  /** 失败时的错误信息 */
  error?: string;
}

// 旧版记录使用图片专属字段，读取时转换为通用 detail
interface LegacyTaskRecord extends Omit<TaskRecord, "detail"> {
  detail?: string;
  size?: string;
  quality?: "standard" | "hd";
  count?: number;
}

function toTaskRecord(raw: LegacyTaskRecord): TaskRecord {
  if (typeof raw.detail === "string") return raw as TaskRecord;
  const quality = raw.quality === "hd" ? "高清" : "标准";
  const size = (raw.size ?? "1024x1024").replace("x", "×");
  return {
    ...raw,
    detail: `${quality}质量 ${size} × ${raw.count ?? 1} 张`,
  };
}

const STORAGE_KEY = "ai-task-hub:tasks";
const MAX_TASKS = 100;
const EMPTY_TASKS: TaskRecord[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getTasks(): TaskRecord[] {
  if (!isBrowser()) return EMPTY_TASKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as LegacyTaskRecord[]).map(toTaskRecord)
      : EMPTY_TASKS;
  } catch {
    return EMPTY_TASKS;
  }
}

// ---- useSyncExternalStore 适配：缓存快照并在变更时通知订阅者 ----

let snapshot: TaskRecord[] | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  snapshot = null;
  listeners.forEach((listener) => listener());
}

export function subscribeTasks(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTasksSnapshot(): TaskRecord[] {
  if (snapshot === null) snapshot = getTasks();
  return snapshot;
}

export function getServerTasksSnapshot(): TaskRecord[] {
  return EMPTY_TASKS;
}

export function addTask(
  task: Omit<TaskRecord, "id" | "createdAt">
): TaskRecord | null {
  if (!isBrowser()) return null;
  const record: TaskRecord = {
    ...task,
    id: `task_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  try {
    const tasks = [record, ...getTasks()].slice(0, MAX_TASKS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    notify();
    return record;
  } catch {
    return null;
  }
}

export function clearTasks(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notify();
  } catch {
    // 忽略存储错误
  }
}

export function formatTaskTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

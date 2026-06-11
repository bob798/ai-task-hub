import type { ImageQuality, ImageSize } from "./pricing";

export type TaskStatus = "completed" | "failed";

export interface TaskRecord {
  id: string;
  type: string;
  status: TaskStatus;
  createdAt: string;
  cost: number;
  prompt: string;
  size: ImageSize;
  quality: ImageQuality;
  count: number;
  mock: boolean;
  /** 失败时的错误信息 */
  error?: string;
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
    return Array.isArray(parsed) ? (parsed as TaskRecord[]) : EMPTY_TASKS;
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

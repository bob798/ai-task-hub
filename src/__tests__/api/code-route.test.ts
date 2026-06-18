import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/balance", () => ({
  deductBalance: vi.fn(),
  addBalance: vi.fn(),
}));

vi.mock("@/lib/tasks", () => ({
  createTask: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

vi.mock("@/lib/openai", () => ({
  chatComplete: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/error-reporter", () => ({
  reportError: vi.fn(),
}));

vi.mock("@/lib/usage-monitor", () => ({
  trackUsage: vi.fn(),
}));

import { POST } from "@/app/api/code/route";
import { getServerSession } from "next-auth";
import { deductBalance, addBalance } from "@/lib/balance";
import { createTask, updateTaskStatus } from "@/lib/tasks";
import { chatComplete } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";

const mockGetServerSession = vi.mocked(getServerSession);
const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockDeductBalance = vi.mocked(deductBalance);
const mockCreateTask = vi.mocked(createTask);
const mockUpdateTaskStatus = vi.mocked(updateTaskStatus);
const mockChatComplete = vi.mocked(chatComplete);

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/code", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/code", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockCheckRateLimit.mockReturnValue({ allowed: true, retryAfter: 0 });
    mockDeductBalance.mockResolvedValue({ success: true, newBalance: 9.0 } as never);
    mockCreateTask.mockResolvedValue({ id: "task-1" } as never);
    mockUpdateTaskStatus.mockResolvedValue(undefined as never);
    // No OPENAI_API_KEY by default → mock mode
    delete process.env.OPENAI_API_KEY;
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ prompt: "write a hello world" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfter: 30 });
    const res = await POST(makeRequest({ prompt: "write a hello world" }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(res.headers.get("Retry-After")).toBe("30");
  });

  it("returns 402 when balance is insufficient", async () => {
    mockDeductBalance.mockResolvedValue({
      success: false,
      currentBalance: 0,
    } as never);
    const res = await POST(makeRequest({ prompt: "write a hello world" }));
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.code).toBe("INSUFFICIENT_BALANCE");
  });

  it("returns 200 with mock code when OPENAI_API_KEY is not set", async () => {
    const res = await POST(makeRequest({ prompt: "write a hello world", language: "Python" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mock).toBe(true);
    expect(typeof data.code).toBe("string");
    expect(data.code.length).toBeGreaterThan(0);
    expect(data.taskId).toBe("task-1");
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith("task-1", "COMPLETED", expect.objectContaining({ code: expect.any(String) }));
    // chatComplete must NOT be called in mock mode
    expect(mockChatComplete).not.toHaveBeenCalled();
  });

  it("returns 400 for missing prompt", async () => {
    const res = await POST(makeRequest({ language: "Python" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for empty prompt", async () => {
    const res = await POST(makeRequest({ prompt: "   " }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

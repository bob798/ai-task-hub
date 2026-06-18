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

import { POST } from "@/app/api/document/route";
import { getServerSession } from "next-auth";
import { deductBalance } from "@/lib/balance";
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
  return new NextRequest("http://localhost/api/document", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/document", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockCheckRateLimit.mockReturnValue({ allowed: true, retryAfter: 0 });
    mockDeductBalance.mockResolvedValue({ success: true, newBalance: 9.0 } as never);
    mockCreateTask.mockResolvedValue({ id: "task-doc-1" } as never);
    mockUpdateTaskStatus.mockResolvedValue(undefined as never);
    // No OPENAI_API_KEY by default → mock mode
    delete process.env.OPENAI_API_KEY;
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ text: "Some document text" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for empty text", async () => {
    const res = await POST(makeRequest({ text: "   " }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for missing text", async () => {
    const res = await POST(makeRequest({ mode: "summarize" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 402 when balance is insufficient", async () => {
    mockDeductBalance.mockResolvedValue({
      success: false,
      currentBalance: 0,
    } as never);
    const res = await POST(makeRequest({ text: "Some document text to process" }));
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.code).toBe("INSUFFICIENT_BALANCE");
  });

  it("returns 200 with mock result when OPENAI_API_KEY is not set", async () => {
    const res = await POST(makeRequest({ text: "Some document text to process", mode: "summarize" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mock).toBe(true);
    expect(typeof data.result).toBe("string");
    expect(data.result.length).toBeGreaterThan(0);
    expect(data.taskId).toBe("task-doc-1");
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith(
      "task-doc-1",
      "COMPLETED",
      expect.objectContaining({ result: expect.any(String) })
    );
    // chatComplete must NOT be called in mock mode
    expect(mockChatComplete).not.toHaveBeenCalled();
  });

  it("defaults to summarize mode when mode is unrecognized", async () => {
    const res = await POST(makeRequest({ text: "Some text", mode: "unknown-mode" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mock).toBe(true);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfter: 45 });
    const res = await POST(makeRequest({ text: "Some document text" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("45");
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

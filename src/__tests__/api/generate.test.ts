import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock all server-side dependencies before importing the route
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
  generateImages: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/pricing", () => ({
  calculateTotalCost: vi.fn(),
}));

import { POST } from "@/app/api/generate/route";
import { getServerSession } from "next-auth";
import { deductBalance, addBalance } from "@/lib/balance";
import { createTask, updateTaskStatus } from "@/lib/tasks";
import { generateImages } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";
import { calculateTotalCost } from "@/lib/pricing";

const mockGetServerSession = vi.mocked(getServerSession);
const mockDeductBalance = vi.mocked(deductBalance);
const mockAddBalance = vi.mocked(addBalance);
const mockCreateTask = vi.mocked(createTask);
const mockUpdateTaskStatus = vi.mocked(updateTaskStatus);
const mockGenerateImages = vi.mocked(generateImages);
const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockCalculateTotalCost = vi.mocked(calculateTotalCost);

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/generate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/generate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Restore default implementations after resetAllMocks clears them
    mockCalculateTotalCost.mockReturnValue(0.04);
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockCheckRateLimit.mockReturnValue({ allowed: true, retryAfter: 0 });
    mockDeductBalance.mockResolvedValue({ success: true, newBalance: 9.96 });
    mockCreateTask.mockResolvedValue({ id: "task-1" } as never);
    mockUpdateTaskStatus.mockResolvedValue(undefined as never);
    mockGenerateImages.mockResolvedValue({ data: [{ url: "https://example.com/img.png" }] } as never);
    // No OPENAI_API_KEY by default → mock mode
    delete process.env.OPENAI_API_KEY;
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ prompt: "a cat" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for empty prompt", async () => {
    const res = await POST(makeRequest({ prompt: "   " }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for prompt exceeding 4000 chars", async () => {
    const res = await POST(makeRequest({ prompt: "a".repeat(4001) }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfter: 30 });
    const res = await POST(makeRequest({ prompt: "a cat" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 402 when balance is insufficient", async () => {
    mockDeductBalance.mockResolvedValue({
      success: false,
      error: "INSUFFICIENT_BALANCE",
      currentBalance: 0,
    });
    const res = await POST(makeRequest({ prompt: "a cat" }));
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.code).toBe("INSUFFICIENT_BALANCE");
    expect(data.currentBalance).toBe(0);
  });

  it("returns 200 with mock images when OPENAI_API_KEY is not set", async () => {
    process.env.OPENAI_API_KEY = "";
    const res = await POST(makeRequest({ prompt: "a cat", n: 1 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mock).toBe(true);
    expect(Array.isArray(data.images)).toBe(true);
    expect(data.images.length).toBe(1);
    expect(data.taskId).toBe("task-1");
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith("task-1", "COMPLETED", expect.any(Object));
    // generateImages should NOT be called in mock mode
    expect(mockGenerateImages).not.toHaveBeenCalled();
  });

  it("calls addBalance (refund) when image generation fails", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    mockGenerateImages.mockRejectedValue(new Error("OpenAI error"));
    const res = await POST(makeRequest({ prompt: "a cat" }));
    expect(res.status).toBe(500);
    expect(mockAddBalance).toHaveBeenCalledWith(
      "u1",
      0.04,
      "图片生成失败退款",
      { type: "REFUND" }
    );
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith("task-1", "FAILED", undefined, "OpenAI error");
  });
});

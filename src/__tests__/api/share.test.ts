import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { POST } from "@/app/api/tasks/[id]/share/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

const mockGetServerSession = vi.mocked(getServerSession);
const mockTaskFindUnique = vi.mocked(prisma.task.findUnique);
const mockTaskUpdate = vi.mocked(prisma.task.update);

// The route receives params as a Promise<{ id: string }>.
function makeCall(taskId: string) {
  const request = new NextRequest(`http://localhost/api/tasks/${taskId}/share`, {
    method: "POST",
  });
  return POST(request, { params: Promise.resolve({ id: taskId }) });
}

describe("POST /api/tasks/[id]/share", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockTaskFindUnique.mockResolvedValue({
      id: "task-abc",
      userId: "user-1",
      shareToken: null,
    } as never);
    mockTaskUpdate.mockResolvedValue({ id: "task-abc", shareToken: "tok123" } as never);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await makeCall("task-abc");
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 404 when task does not exist", async () => {
    mockTaskFindUnique.mockResolvedValue(null);
    const res = await makeCall("nonexistent");
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 403 when task is not owned by the authenticated user", async () => {
    mockTaskFindUnique.mockResolvedValue({
      id: "task-abc",
      userId: "other-user",
      shareToken: null,
    } as never);
    const res = await makeCall("task-abc");
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 200 with shareUrl on success (no existing token)", async () => {
    const res = await makeCall("task-abc");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.shareUrl).toBe("string");
    expect(data.shareUrl).toMatch(/^\/s\//);
    // Should have persisted the new token
    expect(mockTaskUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "task-abc" } })
    );
  });

  it("returns 200 with existing shareUrl when token already set", async () => {
    mockTaskFindUnique.mockResolvedValue({
      id: "task-abc",
      userId: "user-1",
      shareToken: "existing-token",
    } as never);
    const res = await makeCall("task-abc");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.shareUrl).toBe("/s/existing-token");
    // No update needed when token already exists
    expect(mockTaskUpdate).not.toHaveBeenCalled();
  });
});

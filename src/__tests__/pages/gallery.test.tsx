import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "u1", name: "Test" } }, status: "authenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/gallery",
  useSearchParams: () => new URLSearchParams(),
}));

import GalleryPage from "@/app/gallery/page";

const MOCK_TASKS = [
  {
    id: "task-1",
    type: "image_generation",
    status: "COMPLETED" as const,
    prompt: "a beautiful cat",
    params: { quality: "standard", size: "1024x1024", count: 1 },
    cost: "0.50",
    errorMsg: null,
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "task-2",
    type: "code_generation",
    status: "FAILED" as const,
    prompt: "build a server",
    params: { language: "Python" },
    cost: "0.00",
    errorMsg: "API timeout",
    createdAt: "2026-01-02T12:00:00.000Z",
  },
];

describe("GalleryPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    // Never resolve so the component stays in loading state
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    render(<GalleryPage />);
    expect(screen.getAllByText("加载中...").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state with 还没有作品 when no tasks", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ tasks: [], total: 0 }), { status: 200 })
      )
    );

    render(<GalleryPage />);
    expect(await screen.findByText("还没有作品")).toBeInTheDocument();
  });

  it("renders task list when tasks returned", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ tasks: MOCK_TASKS, total: 2 }), { status: 200 })
      )
    );

    render(<GalleryPage />);
    // The prompt is embedded inside a combined description string, use regex
    expect(await screen.findByText(/a beautiful cat/)).toBeInTheDocument();
    expect(screen.getAllByText("图片生成").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("代码生成").length).toBeGreaterThanOrEqual(1);
  });

  it("shows stats bar with correct counts", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ tasks: MOCK_TASKS, total: 2 }), { status: 200 })
      )
    );

    render(<GalleryPage />);
    // Wait for loading to finish
    await screen.findByText("总作品数");
    expect(screen.getAllByText("总作品数").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("已完成").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("累计消费").length).toBeGreaterThanOrEqual(1);
    // total count shown
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
  });

  it("继续创作 button links to /create/image", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ tasks: [], total: 0 }), { status: 200 })
      )
    );

    render(<GalleryPage />);
    await screen.findByText("还没有作品");
    const links = screen.getAllByRole("link", { name: "继续创作" });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("href", "/create/image");
  });
});

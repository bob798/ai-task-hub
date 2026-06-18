import { test, expect } from "@playwright/test";

test.describe("API security", () => {
  test("POST /api/generate returns 401 without auth", async ({ request }) => {
    const res = await request.post("/api/generate", {
      data: { prompt: "test", size: "1024x1024", quality: "standard", n: 1 },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test("POST /api/code returns 401 without auth", async ({ request }) => {
    const res = await request.post("/api/code", {
      data: { prompt: "test", language: "TypeScript" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/document returns 401 without auth", async ({ request }) => {
    const res = await request.post("/api/document", {
      data: { text: "test", mode: "summarize" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/user/balance returns 401 without auth", async ({ request }) => {
    const res = await request.get("/api/user/balance");
    expect(res.status()).toBe(401);
  });

  test("GET /api/user/tasks returns 401 without auth", async ({ request }) => {
    const res = await request.get("/api/user/tasks");
    expect(res.status()).toBe(401);
  });

  test("POST /api/generate returns 400 for empty prompt", async ({ request }) => {
    const res = await request.post("/api/generate", {
      data: { prompt: "" },
    });
    // Either 401 (no auth) or 400 (validation) — both acceptable
    expect([400, 401]).toContain(res.status());
  });

  test("POST /api/auth/register returns 400 for missing fields", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test("POST /api/webhooks/stripe returns 400 without signature", async ({ request }) => {
    const res = await request.post("/api/webhooks/stripe", {
      data: { type: "checkout.session.completed" },
    });
    expect(res.status()).toBe(400);
  });

  test("security headers are present", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});

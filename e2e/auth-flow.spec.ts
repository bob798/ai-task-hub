import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/create/image");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("callbackUrl");
  });

  test("gallery redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("wallet redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("login page shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="your@email.com"]', "wrong@test.com");
    await page.fill('input[placeholder="至少 8 个字符"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.getByText("邮箱或密码错误")).toBeVisible({ timeout: 5000 });
  });

  test("register page validates short password client-side", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[placeholder="your@email.com"]', "test@test.com");
    await page.fill('input[placeholder="至少 8 个字符"]', "short");
    await page.click('button:has-text("创建账户")');
    // Should show validation error — use first() to avoid strict mode violation
    await expect(page.locator("text=/密码至少|验证码/").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Old route redirects", () => {
  test("/generate redirects to /create/image", async ({ page }) => {
    await page.goto("/generate");
    // First redirects to /create/image, then proxy redirects to /login (not authenticated)
    await page.waitForURL(/\/(create\/image|login)/);
    expect(page.url()).toMatch(/\/(create\/image|login)/);
  });

  test("/code redirects to /create/code", async ({ page }) => {
    await page.goto("/code");
    await page.waitForURL(/\/(create\/code|login)/);
    expect(page.url()).toMatch(/\/(create\/code|login)/);
  });

  test("/document redirects to /create/document", async ({ page }) => {
    await page.goto("/document");
    await page.waitForURL(/\/(create\/document|login)/);
    expect(page.url()).toMatch(/\/(create\/document|login)/);
  });

  test("/tasks redirects to /gallery", async ({ page }) => {
    await page.goto("/tasks");
    await page.waitForURL(/\/(gallery|login)/);
    expect(page.url()).toMatch(/\/(gallery|login)/);
  });
});

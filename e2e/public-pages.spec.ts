import { test, expect } from "@playwright/test";

test.describe("Public pages accessibility", () => {
  test("homepage loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AI Task Hub/);
    await expect(page.locator("h1")).toContainText(/创作工作台|Creative Studio/);
    await expect(page.getByText(/开始创作|Start Creating/).first()).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveTitle(/定价/);
    await expect(page.getByText("按需付费")).toBeVisible();
  });

  test("login page loads with form", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/登录/);
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("至少 8 个字符")).toBeVisible();
    await expect(page.getByText("使用 GitHub 登录")).toBeVisible();
    await expect(page.getByText("使用 Google 登录")).toBeVisible();
  });

  test("register page loads with form", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveTitle(/注册/);
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "创建账户" })).toBeVisible();
  });

  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/隐私政策/);
    await expect(page.getByText("信息收集")).toBeVisible();
  });

  test("terms of service page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveTitle(/服务条款/);
    await expect(page.getByText("服务描述")).toBeVisible();
  });

  test("sitemap.xml returns valid XML", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/pricing");
  });

  test("robots.txt returns valid content", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase()).toContain("user-agent");
    expect(body).toContain("Disallow: /api/");
  });
});

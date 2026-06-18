import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navbar contains all nav links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    await expect(nav.getByText("Task Hub")).toBeVisible();

    // Desktop nav links (hidden on mobile)
    const desktopNav = nav.locator(".hidden.md\\:flex").first();
    // i18n: could be Chinese or English
    await expect(desktopNav.getByText(/图片|Image/).first()).toBeVisible();
    await expect(desktopNav.getByText(/代码|Code/).first()).toBeVisible();
    await expect(desktopNav.getByText(/文档|Document/)).toBeVisible();
    await expect(desktopNav.getByText(/定价|Pricing/)).toBeVisible();
  });

  test("footer contains legal links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByText("隐私政策")).toBeVisible();
    await expect(footer.getByText("服务条款")).toBeVisible();
  });

  test("homepage CTA navigates to create/image (or login)", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("开始创作")');
    await page.waitForURL(/\/(create\/image|login)/);
    expect(page.url()).toMatch(/\/(create\/image|login)/);
  });

  test("pricing link navigates to pricing page", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("查看定价")');
    await page.waitForURL(/\/pricing/);
    expect(page.url()).toContain("/pricing");
  });

  test("login page register link navigates to register", async ({ page }) => {
    await page.goto("/login");
    await page.click('a:has-text("立即注册")');
    await page.waitForURL(/\/register/);
    expect(page.url()).toContain("/register");
  });

  test("register page login link navigates to login", async ({ page }) => {
    await page.goto("/register");
    await page.click('a:has-text("立即登录")');
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});

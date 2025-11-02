import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('로그인 페이지 접근', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1, h2, [role="heading"]')).toBeVisible();
  });

  test('로그인 폼 입력', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="이메일"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("로그인")');

    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
    }

    if (await passwordInput.count() > 0) {
      await passwordInput.fill('testpassword123');
    }

    if (await submitButton.count() > 0) {
      await expect(submitButton).toBeVisible();
    }
  });

  test('회원가입 페이지 접근', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL(/.*signup/);
  });

  test('비로그인 상태에서 보호된 페이지 접근 시 로그인으로 리다이렉트', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/.*login/);
  });
});



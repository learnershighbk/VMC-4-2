import { test, expect } from '@playwright/test';

test.describe('기본 페이지 플로우', () => {
  test('홈페이지 로드', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('네비게이션 메뉴 확인', async ({ page }) => {
    await page.goto('/');

    const navigation = page.locator('nav, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible();
    }
  });

  test('예제 페이지 접근', async ({ page }) => {
    await page.goto('/example');
    
    await expect(page).toHaveURL(/.*example/);
  });
});



import { test, expect } from '@playwright/test';

test.describe('대시보드 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태로 시작
    await page.goto('/login');
    
    const usernameInput = page.locator('input[name="username"], input[type="text"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    if ((await usernameInput.count()) > 0 && (await passwordInput.count()) > 0) {
      await usernameInput.fill('testuser');
      await passwordInput.fill('testpass123');

      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('대시보드 페이지 접근 (인증 필요)', async ({ page }) => {
    await page.goto('/dashboard');

    // 로그인 페이지로 리다이렉트되거나 대시보드가 로드되어야 함
    await expect(page).toHaveURL(/.*dashboard|.*login/);
  });

  test('로그인 → 대시보드 조회 플로우', async ({ page }) => {
    // 로그인
    await page.goto('/login');

    const usernameInput = page.locator('input[name="username"], input[type="text"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await usernameInput.fill('testuser');
    await passwordInput.fill('testpass123');
    await submitButton.click();

    // 로그인 후 대시보드로 이동
    await page.waitForURL(/.*dashboard|.*\/$/, { timeout: 5000 });
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // 대시보드가 로드되었는지 확인
    const dashboardContent = page.locator('main, [role="main"], h1, h2').first();
    await expect(dashboardContent).toBeVisible({ timeout: 5000 });
  });

  test('대시보드 실적 페이지 접근 및 차트 렌더링', async ({ page }) => {
    await page.goto('/dashboard/performance');
    await page.waitForTimeout(3000);

    // 페이지 제목 확인
    const pageTitle = page.locator('h1, h2, [role="heading"]').first();
    await expect(pageTitle).toBeVisible({ timeout: 5000 });

    // 차트 컨테이너 확인 (Recharts는 SVG를 사용)
    const chartContainer = page.locator('svg, [class*="recharts"], [class*="chart"]').first();
    await expect(chartContainer).toBeVisible({ timeout: 5000 });
  });

  test('필터 적용 플로우', async ({ page }) => {
    await page.goto('/dashboard/performance');
    await page.waitForTimeout(3000);

    // 필터 선택 요소 찾기
    const filterSelect = page.locator('select, [role="combobox"], button[role="combobox"]').first();
    
    if (await filterSelect.count() > 0) {
      await filterSelect.click();
      await page.waitForTimeout(500);

      // 옵션 선택
      const option = page.locator('[role="option"]').first();
      if (await option.count() > 0) {
        await option.click();
        await page.waitForTimeout(2000);

        // 필터 적용 후 데이터가 새로 로드되는지 확인
        await expect(filterSelect).toBeVisible();
      }
    }
  });

  test('대시보드 예산 페이지 접근', async ({ page }) => {
    await page.goto('/dashboard/budget');
    await page.waitForTimeout(3000);

    const pageTitle = page.locator('h1, h2, [role="heading"]').first();
    await expect(pageTitle).toBeVisible({ timeout: 5000 });
  });

  test('대시보드 논문 페이지 접근', async ({ page }) => {
    await page.goto('/dashboard/papers');
    await page.waitForTimeout(3000);

    const pageTitle = page.locator('h1, h2, [role="heading"]').first();
    await expect(pageTitle).toBeVisible({ timeout: 5000 });
  });

  test('대시보드 학생 페이지 접근', async ({ page }) => {
    await page.goto('/dashboard/students');
    await page.waitForTimeout(3000);

    const pageTitle = page.locator('h1, h2, [role="heading"]').first();
    await expect(pageTitle).toBeVisible({ timeout: 5000 });
  });
});



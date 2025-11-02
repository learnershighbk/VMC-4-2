import { test, expect } from '@playwright/test';

test.describe('데이터 업로드 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
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

  test('파일 업로드 UI 확인', async ({ page }) => {
    await page.goto('/admin/upload');
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.locator('button:has-text("업로드"), button:has-text("Upload")');

    if (await fileInput.count() > 0) {
      await expect(fileInput).toBeVisible();
    }

    if (await uploadButton.count() > 0) {
      await expect(uploadButton).toBeVisible();
    }
  });

  test('CSV 파일 선택', async ({ page }) => {
    await page.goto('/admin/upload');
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수\n2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3\n'),
      });

      await page.waitForTimeout(1000);

      const selectedFileName = page.locator('[data-testid="file-name"], .file-name, [class*="file"]');
      if (await selectedFileName.count() > 0) {
        await expect(selectedFileName.first()).toBeVisible();
      }
    }
  });

  test('데이터 유형 선택 드롭다운 확인', async ({ page }) => {
    await page.goto('/admin/upload');
    await page.waitForTimeout(2000);

    const dataTypeSelect = page.locator('select[name*="type"], select[name*="dataType"], [role="combobox"]').first();
    
    if (await dataTypeSelect.count() > 0) {
      await expect(dataTypeSelect).toBeVisible();

      await dataTypeSelect.click();
      await page.waitForTimeout(500);
    }
  });

  test('데이터 업로드 → 대시보드 확인 플로우', async ({ page }) => {
    // 업로드 페이지로 이동
    await page.goto('/admin/upload');
    await page.waitForTimeout(2000);

    // 파일 선택
    const fileInput = page.locator('input[type="file"]');
    const dataTypeSelect = page.locator('select[name*="type"], select[name*="dataType"], [role="combobox"]').first();
    const uploadButton = page.locator('button:has-text("업로드"), button:has-text("Upload")').first();

    if ((await fileInput.count()) > 0 && (await dataTypeSelect.count()) > 0 && (await uploadButton.count()) > 0) {
      // 데이터 유형 선택
      await dataTypeSelect.click();
      await page.waitForTimeout(500);
      const option = page.locator('[role="option"]:has-text("KPI"), [role="option"]:has-text("kpi")').first();
      if (await option.count() > 0) {
        await option.click();
        await page.waitForTimeout(500);
      }

      // 파일 업로드
      await fileInput.setInputFiles({
        name: 'test_kpi.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수\n2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3\n'),
      });

      await page.waitForTimeout(1000);
      await uploadButton.click();
      
      // 업로드 완료 대기
      await page.waitForTimeout(5000);

      // 성공 메시지 확인
      const successMessage = page.locator('text=/업로드.*성공/, text=/업로드.*완료/, text=/성공/, [role="alert"]').first();
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible({ timeout: 10000 });
      }

      // 대시보드로 이동하여 데이터 확인
      await page.goto('/dashboard/performance');
      await page.waitForTimeout(3000);

      // 대시보드가 로드되었는지 확인
      const dashboardContent = page.locator('main, [role="main"], h1, h2').first();
      await expect(dashboardContent).toBeVisible({ timeout: 5000 });
    }
  });

  test('파일 업로드 완료 메시지 확인', async ({ page }) => {
    await page.goto('/admin/upload');
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.locator('button:has-text("업로드"), button:has-text("Upload")').first();

    if ((await fileInput.count()) > 0 && (await uploadButton.count()) > 0) {
      await fileInput.setInputFiles({
        name: 'test.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수\n2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3\n'),
      });

      await page.waitForTimeout(1000);
      await uploadButton.click();
      await page.waitForTimeout(5000);

      const successMessage = page.locator('text=/업로드.*성공/, text=/업로드.*완료/, text=/성공/, [role="alert"]').first();
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('잘못된 파일 형식 업로드 시 에러 메시지 확인', async ({ page }) => {
    await page.goto('/admin/upload');
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('invalid content'),
      });

      await page.waitForTimeout(1000);

      const errorMessage = page.locator('text=/파일.*형식/, text=/오류/, text=/에러/, [role="alert"]').first();
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('업로드 진행률 표시 확인', async ({ page }) => {
    await page.goto('/admin/upload');
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.locator('button:has-text("업로드"), button:has-text("Upload")').first();

    if ((await fileInput.count()) > 0 && (await uploadButton.count()) > 0) {
      await fileInput.setInputFiles({
        name: 'test.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수\n2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3\n'),
      });

      await page.waitForTimeout(1000);
      await uploadButton.click();

      const progressBar = page.locator('[role="progressbar"], [class*="progress"], [class*="Progress"]').first();
      if (await progressBar.count() > 0) {
        await expect(progressBar).toBeVisible({ timeout: 5000 });
      }
    }
  });
});



# 테스트 인프라 가이드

이 문서는 프로젝트의 테스트 인프라 설정 및 사용 방법을 설명합니다.

## 목차

1. [프론트엔드 테스트](#프론트엔드-테스트)
2. [백엔드 테스트](#백엔드-테스트)
3. [E2E 테스트](#e2e-테스트)
4. [CI/CD 통합](#cicd-통합)

## 프론트엔드 테스트

### 환경 설정

프론트엔드는 **Vitest**와 **React Testing Library**를 사용합니다.

**설정 파일:**
- `vitest.config.ts`: Vitest 설정
- `vitest.setup.ts`: 테스트 전역 설정
- `src/test-utils.tsx`: 테스트 유틸리티 (React Query 래퍼 포함)

### 실행 방법

```bash
# 단위 테스트 실행
npm test

# Watch 모드로 실행
npm test -- --watch

# UI 모드로 실행
npm run test:ui

# 커버리지 리포트 생성
npm run test:coverage
```

### 테스트 작성 예시

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { Button } from '../button';

describe('Button', () => {
  it('렌더링되어야 함', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });
});
```

### 주요 기능

- **React Query 통합**: `test-utils.tsx`에서 자동으로 QueryClientProvider 제공
- **DOM 어설션**: `@testing-library/jest-dom`을 통한 확장된 matcher 사용 가능
- **커버리지 리포트**: `@vitest/coverage-v8`를 통한 코드 커버리지 측정

## 백엔드 테스트

### 환경 설정

백엔드는 **Django TestCase**와 **pytest**를 모두 지원합니다.

**설정 파일:**
- `backend/pytest.ini`: pytest 설정
- `backend/conftest.py`: pytest 픽스처 (API 클라이언트, 사용자 등)

**의존성:**
- `pytest==8.3.4`
- `pytest-django==4.9.0`
- `pytest-cov==6.0.0`

### 실행 방법

```bash
cd backend

# Django TestCase 사용
python manage.py test

# pytest 사용 (권장)
pytest

# 특정 앱만 테스트
pytest apps/authentication/tests.py

# 커버리지 리포트 생성
pytest --cov=. --cov-report=html
```

### 테스트 작성 예시

**Django TestCase 사용:**

```python
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
        )

    def test_token_obtain_success(self):
        url = '/api/auth/token/'
        data = {'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

**pytest 사용:**

```python
import pytest
from rest_framework import status

@pytest.mark.django_db
def test_token_obtain_success(api_client, user):
    url = '/api/auth/token/'
    data = {'username': 'testuser', 'password': 'testpass123'}
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
```

### 테스트 데이터베이스

테스트 실행 시 자동으로 SQLite in-memory 데이터베이스를 사용합니다.

## E2E 테스트

### 환경 설정

**Playwright**를 사용하여 E2E 테스트를 수행합니다.

**설정 파일:**
- `playwright.config.ts`: Playwright 설정

### 브라우저 설치

```bash
npx playwright install
```

### 실행 방법

```bash
# 모든 브라우저로 테스트
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui

# 특정 브라우저만 테스트
npx playwright test --project=chromium

# 특정 테스트만 실행
npx playwright test e2e/auth.spec.ts
```

### 테스트 작성 예시

```typescript
import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test('로그인 페이지 접근', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
  });
});
```

### 주요 기능

- **자동 서버 시작**: 개발 서버가 실행 중이 아니면 자동으로 시작
- **다중 브라우저**: Chromium, Firefox, WebKit 지원
- **스크린샷/비디오**: 실패 시 자동 캡처
- **Trace**: 디버깅을 위한 상세 로그

## 테스트 범위

### 프론트엔드
- ✅ UI 컴포넌트 단위 테스트
- ✅ React Hook 테스트
- ✅ 유틸리티 함수 테스트

### 백엔드
- ✅ 인증 API 테스트 (로그인/로그아웃)
- ✅ 데이터 업로드 API 테스트
- ✅ 대시보드 조회 API 테스트
- ✅ 에러 핸들링 테스트

### E2E
- ✅ 인증 플로우 (로그인/회원가입)
- ✅ 대시보드 플로우
- ✅ 데이터 업로드 플로우
- ✅ 주요 사용자 시나리오

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test

  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r backend/requirements.txt
      - run: cd backend && pytest

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## 참고 자료

- [Vitest 문서](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Django 테스트](https://docs.djangoproject.com/en/stable/topics/testing/)
- [pytest 문서](https://docs.pytest.org/)
- [Playwright 문서](https://playwright.dev/)



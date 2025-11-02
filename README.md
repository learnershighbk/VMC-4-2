# Project-4-2

Django REST Framework 백엔드와 Next.js 프론트엔드로 구성된 풀스택 프로젝트입니다.

## 프로젝트 구조

```
Project-4-2/
├── backend/              # Django REST Framework 백엔드
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/           # Django 설정
│   └── apps/             # Django 앱들
│       ├── authentication/
│       ├── data_upload/
│       └── dashboard/
└── src/                  # Next.js 프론트엔드
    ├── app/              # Next.js App Router
    ├── components/       # UI 컴포넌트
    ├── features/         # 기능별 모듈
    └── lib/              # 유틸리티
```

## 기술 스택

### 백엔드
- Django 4.2+ / Django REST Framework 3.14+
- Python 3.11+
- PostgreSQL
- Pandas (CSV 처리)
- JWT 인증

### 프론트엔드
- Next.js 14+
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Zustand

## 시작하기

### 1. 백엔드 설정 및 실행

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정 (.env 파일 생성)
# 자세한 내용은 backend/README.md 참고

# 데이터베이스 마이그레이션
python manage.py migrate

# 슈퍼유저 생성
python manage.py createsuperuser

# 개발 서버 실행
python manage.py runserver
# Backend: http://localhost:8000
```

### 2. 프론트엔드 설정 및 실행

```bash
# 프로젝트 루트에서
npm install

# 개발 서버 실행
npm run dev
# Frontend: http://localhost:3000
```

## 개발 가이드

### 백엔드 개발
- 자세한 내용은 [`backend/README.md`](backend/README.md) 참고
- API 명세: [`prompts/api.md`](prompts/api.md)
- 데이터베이스 스키마: [`prompts/database.md`](prompts/database.md)

### 프론트엔드 개발
- 개발 가이드: [`CLAUDE.md`](CLAUDE.md)
- 모든 컴포넌트는 Client Component (`"use client"`) 사용
- API 호출은 `@/lib/remote/api-client`를 통해 처리
- 상태 관리는 React Query 사용

## API 엔드포인트

백엔드 서버가 `http://localhost:8000`에서 실행 중일 때:

- **인증**
  - `POST /api/auth/token/` - JWT 토큰 발급
  - `POST /api/auth/token/refresh/` - 토큰 갱신

- **데이터 업로드**
  - `POST /api/data/upload/` - CSV 파일 업로드

- **대시보드**
  - `GET /api/dashboard/metrics/` - 대시보드 데이터 조회

## 배포

### Railway.app 배포

#### 백엔드 서비스
1. Railway 프로젝트 생성
2. PostgreSQL 데이터베이스 추가
3. 환경 변수 설정
4. Start Command: `gunicorn config.wsgi:application`

#### 프론트엔드 서비스
1. Railway 프로젝트에 서비스 추가
2. 환경 변수에 백엔드 URL 설정
3. 자동 배포

## 테스트

### 프론트엔드 테스트

```bash
# 단위 테스트 실행
npm test

# 테스트 UI 모드
npm run test:ui

# 커버리지 리포트 생성
npm run test:coverage
```

**사용 기술:**
- Vitest: 빠른 테스트 러너
- React Testing Library: 컴포넌트 테스트
- @testing-library/jest-dom: DOM 어설션

**테스트 위치:**
- `src/**/__tests__/**/*.test.tsx`
- `src/**/__tests__/**/*.test.ts`

### 백엔드 테스트

```bash
cd backend

# Django 테스트 실행
python manage.py test

# pytest로 테스트 실행 (권장)
pytest

# 커버리지 리포트 생성
pytest --cov=. --cov-report=html
```

**사용 기술:**
- Django TestCase: Django 통합 테스트
- pytest: 고급 테스트 기능
- pytest-django: Django와 pytest 통합
- pytest-cov: 코드 커버리지

**테스트 위치:**
- `backend/apps/**/tests.py`
- `backend/**/test_*.py`

### E2E 테스트

```bash
# E2E 테스트 실행
npm run test:e2e

# E2E 테스트 UI 모드
npm run test:e2e:ui

# 특정 브라우저로 테스트
npx playwright test --project=chromium
```

**사용 기술:**
- Playwright: 브라우저 자동화 및 E2E 테스트

**테스트 위치:**
- `e2e/**/*.spec.ts`

**테스트 범위:**
- 인증 플로우 (로그인/로그아웃)
- 대시보드 플로우
- 데이터 업로드 플로우
- 주요 사용자 시나리오

## 문서

- [`CLAUDE.md`](CLAUDE.md) - 개발 가이드라인 및 규칙
- [`prompts/prd.md`](prompts/prd.md) - 제품 요구사항 문서
- [`prompts/spec.md`](prompts/spec.md) - 기술 명세
- [`prompts/api.md`](prompts/api.md) - REST API 명세
- [`prompts/database.md`](prompts/database.md) - 데이터베이스 스키마
- [`prompts/dataflow.md`](prompts/dataflow.md) - 데이터 흐름
- [`backend/README.md`](backend/README.md) - 백엔드 상세 가이드

## 라이선스

MIT

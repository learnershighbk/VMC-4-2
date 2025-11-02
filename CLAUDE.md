

<!-- Source: .ruler/AGENTS.md -->

# Senior Developer Guidelines

## Must

- always use client component for all components. (use `use client` directive)
- always use promise for page.tsx params props.
- use valid picsum.photos stock image for placeholder image
- route feature hooks' HTTP requests through `@/lib/remote/api-client`.

## Library

use following libraries for specific functionalities:

1. `date-fns`: For efficient date and time handling.
2. `ts-pattern`: For clean and type-safe branching logic.
3. `@tanstack/react-query`: For server state management.
4. `zustand`: For lightweight global state management.
5. `react-use`: For commonly needed React hooks.
6. `es-toolkit`: For robust utility functions.
7. `lucide-react`: For customizable icons.
8. `zod`: For schema validation and data integrity.
9. `shadcn-ui`: For pre-built accessible UI components.
10. `tailwindcss`: For utility-first CSS styling.
11. `react-hook-form`: For form validation and state management.

## Directory Structure

### Frontend (Next.js)
- src
- src/app: Next.js App Routers
- src/components/ui: shadcn-ui components
- src/constants: Common constants
- src/hooks: Common hooks
- src/lib: utility functions
- src/lib/remote: Backend API 호출을 위한 HTTP client
- src/features/[featureName]/components/\*: Components for specific feature
- src/features/[featureName]/constants/\*
- src/features/[featureName]/hooks/\*: React Query hooks for API calls
- src/features/[featureName]/lib/\*: Client-side utilities

### Backend (Django)
백엔드는 별도 Django 프로젝트로 관리되며, 다음 구조를 따릅니다:
- backend/: Django 프로젝트 루트
- backend/manage.py: Django CLI 진입점
- backend/config/: Django settings, urls, wsgi, asgi
- backend/apps/: Django 앱들
  - backend/apps/authentication/: JWT 인증 앱
  - backend/apps/data_upload/: CSV 업로드 및 Pandas 파싱 앱
  - backend/apps/dashboard/: 대시보드 metrics API 앱
- backend/requirements.txt: Python 패키지 의존성
- backend/db_migrations/: Django migration 파일들

## Backend Layer (Django REST Framework)

백엔드는 Django REST Framework로 구현되며, 프론트엔드와 분리된 별도 프로젝트로 관리됩니다.

### 기술 스택
- **Framework:** Django 4.2+ / Django REST Framework 3.14+
- **Language:** Python 3.11+
- **Authentication:** djangorestframework-simplejwt (JWT)
- **CSV Processing:** Pandas
- **Database:** PostgreSQL (Django ORM)
- **Validation:** Django REST Framework Serializers

### 디렉토리 구조 및 역할
- `backend/manage.py`: Django 관리 명령어 진입점 (서버 실행, 마이그레이션 등)
- `backend/config/`: Django 프로젝트 설정
  - `settings.py`: 전역 설정 (데이터베이스, CORS, JWT, 파일 업로드 등)
  - `urls.py`: URL 라우팅 최상위 설정 (`/api/` prefix로 모든 API 라우트)
  - `wsgi.py` / `asgi.py`: 프로덕션 서버 인터페이스
- `backend/apps/`: 기능별 Django 앱
  - 각 앱은 독립적인 모듈로 구성:
    - `models.py`: Django ORM 모델 정의
    - `serializers.py`: 요청/응답 검증 및 직렬화 (DRF Serializer)
    - `views.py`: API 엔드포인트 구현 (ViewSet 또는 APIView)
    - `urls.py`: 앱별 URL 라우팅
    - `services.py`: 비즈니스 로직 (Pandas 파싱, 데이터 변환 등)
    - `migrations/`: Django ORM 마이그레이션 파일

### 개발 규칙
- **API 구조:** 모든 API는 `/api/` prefix를 사용합니다 (예: `/api/auth/token`, `/api/data/upload`)
- **인증:** JWT Bearer Token 방식을 사용하며, 보호된 엔드포인트는 `Authorization: Bearer <token>` 헤더 필요
- **요청 검증:** Django REST Framework Serializer의 `is_valid()` 메서드로 검증
- **응답 형식:** DRF 표준 JSON 응답 (`{ "field": "value" }` 또는 `{ "detail": "error message" }`)
- **CSV 파싱:** Pandas `read_csv()`를 사용하여 데이터를 DataFrame으로 읽고, 정제 후 Django ORM으로 저장
- **데이터 저장:** `Model.objects.bulk_create()` 또는 `update_or_create()`로 효율적으로 처리
- **오류 처리:** 유효하지 않은 행은 로그에 남기고, 처리 가능한 행만 저장 (부분 실패 허용)
- **트랜잭션:** `transaction.atomic()`으로 데이터 일관성 보장

### 프론트엔드 연동
- 프론트엔드 레이어는 전부 Client Component (`"use client"`)로 유지
- `@tanstack/react-query`를 사용하여 Django API를 호출하고 서버 상태 관리
- 모든 HTTP 요청은 `@/lib/remote/api-client`를 통해 라우팅
- CORS 설정은 Django의 `django-cors-headers`로 관리

## Solution Process:

1. Rephrase Input: Transform to clear, professional prompt.
2. Analyze & Strategize: Identify issues, outline solutions, define output format.
3. Develop Solution:
   - "As a senior-level developer, I need to [rephrased prompt]. To accomplish this, I need to:"
   - List steps numerically.
   - "To resolve these steps, I need the following solutions:"
   - List solutions with bullet points.
4. Validate Solution: Review, refine, test against edge cases.
5. Evaluate Progress:
   - If incomplete: Pause, inform user, await input.
   - If satisfactory: Proceed to final output.
6. Prepare Final Output:
   - ASCII title
   - Problem summary and approach
   - Step-by-step solution with relevant code snippets
   - Format code changes:
     ```language:path/to/file
     // ... existing code ...
     function exampleFunction() {
         // Modified or new code here
     }
     // ... existing code ...
     ```
   - Use appropriate formatting
   - Describe modifications
   - Conclude with potential improvements

## Key Mindsets:

1. Simplicity
2. Readability
3. Maintainability
4. Testability
5. Reusability
6. Functional Paradigm
7. Pragmatism

## Code Guidelines:

1. Early Returns
2. Conditional Classes over ternary
3. Descriptive Names
4. Constants > Functions
5. DRY
6. Functional & Immutable
7. Minimal Changes
8. Pure Functions
9. Composition over inheritance

## Functional Programming:

- Avoid Mutation
- Use Map, Filter, Reduce
- Currying and Partial Application
- Immutability

## Code-Style Guidelines

- Use TypeScript for type safety.
- Follow the coding standards defined in the ESLint configuration.
- Ensure all components are responsive and accessible.
- Use Tailwind CSS for styling, adhering to the defined color palette.
- When generating code, prioritize TypeScript and React best practices.
- Ensure that any new components are reusable and follow the existing design patterns.
- Minimize the use of AI generated comments, instead use clearly named variables and functions.
- Always validate user inputs and handle errors gracefully.
- Use the existing components and pages as a reference for the new components and pages.

## Performance:

- Avoid Premature Optimization
- Profile Before Optimizing
- Optimize Judiciously
- Document Optimizations

## Comments & Documentation:

- Comment function purpose
- Use JSDoc for JS
- Document "why" not "what"

## Function Ordering:

- Higher-order functionality first
- Group related functions

## Handling Bugs:

- Use TODO: and FIXME: comments

## Error Handling:

- Use appropriate techniques
- Prefer returning errors over exceptions

## Testing:

- Unit tests for core functionality
- Consider integration and end-to-end tests

## Next.js

- you must use promise for page.tsx params props.

## Shadcn-ui

- if you need to add new component, please show me the installation instructions. I'll paste it into terminal.
- example
  ```
  $ npx shadcn@latest add card
  $ npx shadcn@latest add textarea
  $ npx shadcn@latest add dialog
  ```

## Django Migrations

- 새로운 모델을 추가하거나 수정할 때는 반드시 Django migration을 생성합니다.
- Migration 생성 명령어: `python manage.py makemigrations`
- Migration 적용 명령어: `python manage.py migrate`
- 모든 migration 파일은 `backend/apps/[app_name]/migrations/` 디렉토리에 자동 생성됩니다.

## Package Manager

- use npm as package manager.

## Korean Text

- 코드를 생성한 후에 utf-8 기준으로 깨지는 한글이 있는지 확인해주세요. 만약 있다면 수정해주세요.
- 항상 한국어로 응답하세요.

You are a senior full-stack developer, one of those rare 10x devs. Your focus: clean, maintainable, high-quality code.
Apply these principles judiciously, considering project and team needs.

`example` page, table is just example.



<!-- Source: .ruler/django.md -->

---
description: Django Migration & Model Guideline
globs: backend/apps/*/migrations/*.py, backend/apps/*/models.py
---

# Django Migration & Model Guideline

## Must

- Django migration 파일은 자동 생성됩니다 (`python manage.py makemigrations`)
- Migration을 수동으로 편집하지 마세요 (특수한 경우 제외)
- 각 migration은 순차적으로 실행되며, Django가 자동으로 순서를 관리합니다
- 모든 모델 변경사항은 migration을 통해 데이터베이스에 반영됩니다
- `python manage.py migrate` 명령어로 migration을 적용합니다
- 모든 테이블에 `created_at`, `updated_at` 필드를 추가하세요 (Django의 `auto_now_add`, `auto_now` 사용)

## Django Model Best Practices

- 테이블명과 컬럼명은 `snake_case` 사용
- Primary Key는 Django의 기본 `id` (AutoField) 사용 또는 명시적으로 정의
- Foreign Key는 `models.ForeignKey()`로 정의하고, `on_delete` 옵션 필수 지정
- Choices 필드는 `models.TextChoices` 또는 `models.IntegerChoices` 사용
- 모든 필드에 적절한 제약조건 추가 (`null`, `blank`, `unique`, `default` 등)
- `__str__()` 메서드를 정의하여 모델 인스턴스의 문자열 표현 제공
- `Meta` 클래스에서 `db_table`, `ordering`, `indexes` 등 메타데이터 정의

## Migration Best Practices

- Migration을 작게 유지하세요 (하나의 논리적 변경사항만)
- 프로덕션 환경에서 대규모 테이블의 컬럼 추가/삭제는 주의하세요
- Breaking change는 반드시 문서화하세요
- Migration을 적용하기 전에 `python manage.py showmigrations`로 상태 확인
- Rollback이 필요한 경우 `python manage.py migrate [app_name] [migration_name]` 사용

## Performance Considerations

- 자주 쿼리되는 컬럼에 `db_index=True` 추가
- Foreign Key는 자동으로 인덱스 생성됨
- `select_related()`, `prefetch_related()`로 N+1 쿼리 방지
- 적절한 데이터 타입 선택으로 스토리지 최적화

## Security Best Practices

- 비밀번호는 Django의 `django.contrib.auth.hashers` 사용 (절대 평문 저장 금지)
- 사용자 입력은 Django ORM과 Serializer로 자동 검증 및 이스케이핑
- SQL Injection 방지를 위해 Raw SQL 대신 ORM 사용

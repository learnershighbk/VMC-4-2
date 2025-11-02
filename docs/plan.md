# 프로젝트 계획서 (Project Plan)

> 이 문서는 대학교 내부 데이터 시각화 대시보드 프로젝트의 전체 로드맵과 MVP 스프린트 계획을 정의합니다.
>
> **기반 문서:** `docs/requirement.md`, `docs/prd.md`

## 1. 개요 (Overview)

- **목표:** Ecount 시스템에서 추출한 CSV 데이터를 기반으로, 주요 성과 지표(실적, 논문, 학생 수, 예산 등)를 직관적으로 파악할 수 있는 웹 대시보드를 구축하여, 데이터 기반 정보를 시각적으로 쉽고 편리하게 확인하여 신속하고 정확한 의사결정을 지원한다.
- **MVP 범위:** 사용자 인증, CSV 파일 업로드, 데이터 파싱 및 저장, 주요 지표 대시보드 시각화
- **예상 기간:** Phase 1 (설계): 완료, Phase 2 (MVP 개발): 4-6주, Phase 3 (테스트 및 배포): 1-2주

## 2. 전체 로드맵 (Overall Roadmap)

### Phase 1: 설계 및 계획 ✅
- **목표:** MVP 개발에 필요한 모든 설계 문서화 완료
- **상태:** 완료
- **주요 산출물:**
  - ✅ `docs/prd.md` - 제품 요구사항 명세서
  - ✅ `docs/userflow.md` - 사용자 상호작용 명세
  - ✅ `docs/usecases.md` - 유스케이스 명세
  - ✅ `docs/dataflow.md` - 데이터 흐름 명세서
  - ✅ `docs/database.md` - 데이터베이스 스키마
  - ✅ `docs/api.md` - REST API 명세서
  - ✅ `docs/dataviz-spec.md` - 시각화 컴포넌트 명세서
  - ✅ `docs/ui-spec.md` - UI 설계 명세서
  - ✅ `docs/spec.md` - 기술 명세서
  - ✅ `docs/plan.md` - 프로젝트 계획서 (본 문서)

### Phase 2: MVP 개발 (4-6주)

#### Sprint 1: 인프라 설정 및 인증 (1주)
- **목표:** 프로젝트 초기 설정 및 사용자 인증 기능 구현
- **주요 작업:**
  1. **프로젝트 초기 설정**
     - Next.js 프로젝트 생성 및 의존성 설치
     - Tailwind CSS, shadcn-ui 설정
     - TypeScript 설정
     - ESLint/Prettier 설정
  2. **Django 백엔드 설정**
     - Django 프로젝트 생성 및 초기 설정
     - PostgreSQL 데이터베이스 연결 설정
     - Django REST Framework 설정
     - djangorestframework-simplejwt 설정
  3. **데이터베이스 마이그레이션**
     - Django User 모델 사용 또는 커스텀 User 모델 생성
     - 초기 마이그레이션 실행
  4. **인증 기능 구현**
     - `POST /api/auth/token` 엔드포인트 구현 (TokenObtainPairView)
     - `POST /api/auth/token/refresh` 엔드포인트 구현 (TokenRefreshView)
     - Django 인증 시스템 활용
     - 로그인 페이지 UI 구현
     - 인증 상태 관리 (Zustand)
     - API 클라이언트 설정 (`src/lib/remote/api-client.ts`)
- **산출물:**
  - 동작하는 로그인 페이지
  - JWT 기반 인증 시스템
  - 기본 프로젝트 구조

#### Sprint 2: 데이터 업로드 기능 (1-2주)
- **목표:** CSV 파일 업로드 및 파싱 기능 구현
- **주요 작업:**
  1. **데이터베이스 마이그레이션**
     - `department_kpi`, `publication_list`, `research_project_data`, `student_roster` 테이블 생성
     - `upload_logs` 테이블 생성
     - 인덱스 및 제약 조건 설정
     - `updated_at` 트리거 설정
  2. **CSV 파싱 로직 구현**
     - CSV 파서 라이브러리 통합 (`csv-parse` 또는 `papaparse`)
     - 4개 파일 유형별 파싱 로직 구현
     - 데이터 타입 변환 로직 (날짜, 숫자, 문자열)
  3. **데이터 검증 로직 구현**
     - Zod 스키마 정의 (각 파일 유형별)
     - 유효성 검증 로직 구현
     - 오류 수집 및 리포트 생성
  4. **업로드 API 구현**
     - `POST /api/data/upload` 엔드포인트 구현 (Django ViewSet)
     - 파일 업로드 처리 (Django FileField, multipart/form-data)
     - Pandas를 사용한 CSV 파싱
     - 배치 삽입 로직 (Django ORM bulk_create)
     - 업로드 로그 저장 (Django 모델)
  5. **업로드 UI 구현**
     - 데이터 업로드 페이지 (`/admin/upload`)
     - 파일 선택/드래그앤드롭 UI
     - 데이터 유형 선택 UI
     - 업로드 진행률 표시
     - 업로드 결과 표시 (성공/실패 행 수, 오류 목록)
- **산출물:**
  - 동작하는 CSV 업로드 기능
  - 데이터 파싱 및 검증 로직
  - 업로드 이력 저장 시스템

#### Sprint 3: 대시보드 API 구현 (1주)
- **목표:** 대시보드 데이터 조회 API 구현
- **주요 작업:**
  1. **메인 대시보드 API**
     - `GET /api/dashboard/overview` 엔드포인트 구현
     - 4개 주요 지표 집계 로직
  2. **실적 대시보드 API**
     - `GET /api/dashboard/performance` 엔드포인트 구현
     - 학과별 취업률 집계
     - 기술이전 수입 추이 집계
     - 교원 현황 집계
     - 국제학술대회 개최 횟수 집계
  3. **논문 대시보드 API**
     - `GET /api/dashboard/papers` 엔드포인트 구현
     - 저널 등급별 분포 집계
     - 학과별 논문 현황 집계
     - 논문 게재 추이 집계
  4. **학생 대시보드 API**
     - `GET /api/dashboard/students` 엔드포인트 구현
     - 학과별 학생 수 집계
     - 과정별 학생 분포 집계
     - 학적상태별 통계 집계
  5. **예산 대시보드 API**
     - `GET /api/dashboard/budget` 엔드포인트 구현
     - 연구비 집행 현황 집계
     - 지원기관별 분포 집계
     - 과제별 집행률 계산
  6. **필터링 로직 구현**
     - 쿼리 파라미터 파싱 및 검증
     - 데이터베이스 필터링 쿼리 구현
- **산출물:**
  - 모든 대시보드 API 엔드포인트
  - 데이터 집계 및 필터링 로직

#### Sprint 4: 대시보드 UI 구현 (1-2주)
- **목표:** 대시보드 시각화 UI 구현
- **주요 작업:**
  1. **공통 컴포넌트 구현**
     - KPI 카드 컴포넌트
     - 차트 카드 래퍼 컴포넌트
     - 필터 컴포넌트 (연도, 단과대학, 학과 등)
     - 데이터 테이블 컴포넌트
  2. **메인 대시보드 UI**
     - 4개 KPI 카드 레이아웃
     - 반응형 그리드 구현
  3. **실적 대시보드 UI**
     - 학과별 취업률 차트 (Horizontal Bar Chart)
     - 기술이전 수입 추이 차트 (Multi-line Chart)
     - 교원 현황 차트 (Grouped Bar Chart)
     - 국제학술대회 개최 횟수 차트 (Bar Chart)
     - 필터 UI
     - 데이터 테이블
  4. **논문 대시보드 UI**
     - 저널 등급별 분포 차트 (Pie Chart)
     - 학과별 논문 게재 수 차트 (Bar Chart)
     - 논문 게재 추이 차트 (Line Chart)
     - 필터 UI
     - 데이터 테이블
  5. **학생 대시보드 UI**
     - 학과별 학생 수 차트 (Bar Chart)
     - 과정별 학생 분포 차트 (Pie Chart)
     - 학적상태별 통계 차트 (Grouped Bar Chart)
     - 필터 UI
     - 데이터 테이블
  6. **예산 대시보드 UI**
     - 연구비 집행 현황 차트 (Area Chart)
     - 지원기관별 분포 차트 (Horizontal Bar Chart)
     - 과제별 집행률 차트 (Progress Bar Chart)
     - 필터 UI
     - 데이터 테이블
  7. **React Query 통합**
     - 모든 API 호출을 React Query로 통합
     - 캐싱 전략 설정
     - 에러 처리 및 로딩 상태 관리
- **산출물:**
  - 모든 대시보드 페이지 UI
  - 차트 시각화 컴포넌트
  - 반응형 레이아웃

#### Sprint 5: 추가 기능 및 개선 (1주)
- **목표:** 업로드 이력 조회, CSV 다운로드, 반응형 최적화
- **주요 작업:**
  1. **업로드 이력 조회**
     - `GET /api/data/upload-logs` 엔드포인트 구현
     - `GET /api/data/upload-logs/:id` 엔드포인트 구현
     - 업로드 이력 테이블 UI
     - 페이지네이션 구현
     - 상세 조회 모달
  2. **CSV 다운로드**
     - `GET /api/dashboard/:type/export` 엔드포인트 구현
     - CSV 생성 로직
     - 다운로드 버튼 UI
  3. **반응형 최적화**
     - 모바일 레이아웃 최적화
     - 태블릿 레이아웃 최적화
     - 햄버거 메뉴 구현
  4. **에러 처리 개선**
     - 전역 에러 바운더리 구현
     - Toast 알림 시스템 통합
     - 로딩 스켈레톤 UI 개선
- **산출물:**
  - 완전한 MVP 기능
  - 반응형 디자인

### Phase 3: 테스트 및 배포 (1-2주)

#### 테스트 단계
- **목표:** MVP 기능 통합 테스트 및 버그 수정
- **주요 작업:**
  1. **기능 테스트**
     - 사용자 스토리 기반 테스트
     - 엣지케이스 테스트
     - 유스케이스 검증
  2. **성능 테스트**
     - 대시보드 로딩 시간 측정 (3초 이내 목표)
     - 대용량 데이터 업로드 테스트
     - 동시 접속 테스트
  3. **보안 테스트**
     - 인증/인가 테스트
     - SQL Injection 테스트
     - XSS 테스트
  4. **사용성 테스트**
     - IT 비전문가 사용자 테스트
     - 사용성 피드백 수집 및 개선

#### 배포 단계
- **목표:** 프로덕션 환경 배포
- **주요 작업:**
  1. **인프라 설정**
     - Vercel 프로젝트 생성 및 Next.js 앱 배포
     - Railway PostgreSQL 프로덕션 데이터베이스 설정
     - 환경 변수 설정
  2. **데이터베이스 마이그레이션**
     - 프로덕션 데이터베이스에 마이그레이션 적용
     - 초기 관리자 계정 생성
  3. **CI/CD 설정**
     - GitHub Actions 워크플로우 설정
     - 자동 배포 파이프라인 구성
  4. **모니터링 설정**
     - 에러 로깅 설정 (선택적)
     - 성능 모니터링 (선택적)
- **산출물:**
  - 배포된 프로덕션 서비스
  - 운영 가이드 문서

## 3. MVP (Sprint 1-5) 상세 계획

### 3.1 사용자 스토리 기반 작업 분해

#### US-001: 사용자 로그인
- **Sprint:** Sprint 1
- **담당:** Backend, Frontend
- **세부 작업:**
  - Backend: `POST /api/auth/login` 엔드포인트 구현
  - Backend: JWT 토큰 생성 로직
  - Backend: 비밀번호 해싱 및 검증
  - Frontend: 로그인 페이지 UI (`/login`)
  - Frontend: 폼 검증 (React Hook Form + Zod)
  - Frontend: 인증 상태 관리 (Zustand)
  - Frontend: 인증 미들웨어 (페이지 보호)

#### US-002: 데이터 업로드
- **Sprint:** Sprint 2
- **담당:** Backend, Frontend
- **세부 작업:**
  - Backend: 데이터베이스 마이그레이션 (4개 데이터 테이블)
  - Backend: CSV 파싱 로직 (4개 파일 유형별)
  - Backend: 데이터 검증 로직 (Zod 스키마)
  - Backend: `POST /api/data/upload` 엔드포인트 구현
  - Backend: 배치 삽입 로직 (Django ORM bulk_create)
  - Frontend: 데이터 업로드 페이지 UI (`/admin/upload`)
  - Frontend: 파일 선택/드래그앤드롭 UI
  - Frontend: 업로드 진행률 표시
  - Frontend: 업로드 결과 표시

#### US-003: 메인 대시보드 조회
- **Sprint:** Sprint 3, 4
- **담당:** Backend, Frontend
- **세부 작업:**
  - Backend: `GET /api/dashboard/overview` 엔드포인트 구현
  - Backend: 4개 주요 지표 집계 로직
  - Frontend: 메인 대시보드 페이지 UI (`/`)
  - Frontend: 4개 KPI 카드 컴포넌트
  - Frontend: React Query 통합

#### US-004: 실적 대시보드 조회
- **Sprint:** Sprint 3, 4
- **담당:** Backend, Frontend
- **세부 작업:**
  - Backend: `GET /api/dashboard/performance` 엔드포인트 구현
  - Backend: 필터링 로직 (연도, 단과대학, 학과)
  - Backend: 데이터 집계 로직
  - Frontend: 실적 대시보드 페이지 UI (`/dashboard/performance`)
  - Frontend: 4개 차트 컴포넌트 구현
  - Frontend: 필터 UI
  - Frontend: 데이터 테이블

#### US-005: 논문 게재 현황 조회
- **Sprint:** Sprint 3, 4
- **담당:** Backend, Frontend
- **세부 작업:**
  - Backend: `GET /api/dashboard/papers` 엔드포인트 구현
  - Backend: 필터링 및 집계 로직
  - Frontend: 논문 대시보드 페이지 UI (`/dashboard/papers`)
  - Frontend: 3개 차트 컴포넌트 구현

#### US-006: 학생 현황 조회
- **Sprint:** Sprint 3, 4
- **담당:** Backend, Frontend
- **세부 작업:**
  - Backend: `GET /api/dashboard/students` 엔드포인트 구현
  - Backend: 필터링 및 집계 로직
  - Frontend: 학생 대시보드 페이지 UI (`/dashboard/students`)
  - Frontend: 3개 차트 컴포넌트 구현

#### US-007: 예산 집행 내역 조회
- **Sprint:** Sprint 3, 4
- **담당:** Backend, Frontend
- **세부 작업:**
  - Backend: `GET /api/dashboard/budget` 엔드포인트 구현
  - Backend: 집행률 계산 로직
  - Backend: 필터링 및 집계 로직
  - Frontend: 예산 대시보드 페이지 UI (`/dashboard/budget`)
  - Frontend: 3개 차트 컴포넌트 구현

#### US-008: 필터 적용
- **Sprint:** Sprint 4
- **담당:** Frontend
- **세부 작업:**
  - 필터 컴포넌트 구현 (Select, DatePicker 등)
  - React Query queryKey 업데이트 로직
  - URL 쿼리 파라미터 동기화
  - 필터 상태 관리

#### US-009: 데이터 다운로드
- **Sprint:** Sprint 5
- **담당:** Backend, Frontend
- **세부 작업:**
  - Backend: `GET /api/dashboard/:type/export` 엔드포인트 구현
  - Backend: CSV 생성 로직
  - Frontend: 다운로드 버튼 UI

### 3.2 작업 우선순위

**P0 (최우선):**
1. 프로젝트 초기 설정
2. 사용자 인증 기능
3. 데이터 업로드 기능 (최소 1개 파일 유형)
4. 메인 대시보드 (4개 KPI 카드)
5. 실적 대시보드 (최소 2개 차트)

**P1 (높음):**
1. 나머지 데이터 파일 유형 지원
2. 나머지 대시보드 페이지
3. 모든 차트 컴포넌트
4. 필터링 기능
5. 업로드 이력 조회

**P2 (중간):**
1. CSV 다운로드
2. 반응형 최적화
3. 접근성 개선
4. 에러 처리 개선

**P3 (낮음):**
1. 애니메이션 및 인터랙션 개선
2. 성능 최적화
3. 추가 모니터링

## 4. 리스크 관리

### 4.1 기술적 리스크
- **리스크:** 대용량 CSV 파일 처리 시 성능 저하
  - **완화 방안:** 청크 단위 처리, 배치 삽입 최적화, 파일 크기 제한
- **리스크:** 복잡한 데이터 집계 쿼리 성능 저하
  - **완화 방안:** 인덱스 최적화, 쿼리 튜닝, 캐싱 전략

### 4.2 일정 리스크
- **리스크:** 예상보다 개발 시간이 더 소요될 수 있음
  - **완화 방안:** MVP 범위 명확화, 우선순위 기반 개발, 주기적 진행 상황 리뷰

### 4.3 데이터 리스크
- **리스크:** 실제 CSV 파일 구조가 명세와 다를 수 있음
  - **완화 방안:** 실제 샘플 파일 기반 명세 검증, 유연한 파싱 로직 구현

## 5. 성공 기준

### 5.1 기능적 기준
- ✅ 사용자가 로그인하여 시스템에 접근 가능
- ✅ 관리자가 CSV 파일을 업로드하고 데이터가 저장됨
- ✅ 사용자가 모든 대시보드 페이지에서 주요 지표를 확인 가능
- ✅ 필터링 기능이 정상 작동
- ✅ 업로드 이력 조회 가능

### 5.2 비기능적 기준
- ✅ 대시보드 로딩 시간 3초 이내
- ✅ IT 비전문가도 직관적으로 사용 가능
- ✅ 모바일, 태블릿, 데스크톱에서 정상 작동
- ✅ 허가되지 않은 사용자의 접근 차단

## 6. 다음 단계 (Post-MVP)

### Phase 4: 기능 확장 (향후)
- 사용자별 권한 관리
- 상세 데이터 검색 기능
- 리포트 자동 생성 기능
- 실시간 데이터 업데이트 (WebSocket 또는 Server-Sent Events, 향후 확장)
- 데이터 내보내기 기능 확장 (PDF, Excel 등)

### Phase 5: 성능 최적화 (향후)
- 차트 렌더링 최적화
- 데이터베이스 쿼리 최적화
- CDN 활용
- 이미지 최적화

---

**문서 버전:** 1.0  
**작성일:** 2025-01-XX  
**작성자:** plan-writer 에이전트  
**기반 문서:** `docs/requirement.md`, `docs/prd.md`

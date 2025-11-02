# 프로젝트 계획서 (Project Plan)

## 1. 개요 (Overview)
- **목표:** [docs/prd.md를 참고하여 MVP의 핵심 목표를 한 문장으로 요약]
- **기간:** [예상 시작일] ~ [예상 종료일]

## 2. 전체 로드맵 (Overall Roadmap)
> 프로젝트의 주요 단계를 정의합니다.

### Phase 1: 설계 및 계획
- **목표:** MVP 개발에 필요한 모든 설계 문서화 완료
- **주요 산출물:**
  - `docs/prd.md`, `docs/plan.md`, `docs/spec.md`
  - `docs/userflow.md`, `docs/dataflow.md`, `docs/database.md`
  - `docs/api.md`, `docs/dataviz-spec.md`
  - `docs/usecases.md`, `docs/test-cases.md`

### Phase 2: MVP 개발 (Sprint 1)
- **목표:** 핵심 기능(엑셀 업로드, 데이터 처리, 대시보드 시각화) 구현 완료
- **주요 산출물:**
  - 동작하는 MVP 웹 애플리케이션 (백엔드/프론트엔드 코드)

### Phase 3: 테스트 및 배포
- **목표:** MVP 기능 통합 테스트 및 Railway를 통한 프로덕션 배포
- **주요 산출물:**
  - E2E 테스트 결과 보고서
  - 배포된 서비스 URL

## 3. MVP (Sprint 1) 상세 계획
> docs/prd.md의 User Story를 기반으로 이번 스프린트에서 개발할 기능 목록을 기술합니다.

- **US-001: 로그인**
  - **담당:** Backend, Frontend
  - **세부 작업:** 로그인 API 구현, 로그인 UI 페이지 개발
- **US-002: 데이터 업로드**
  - **담당:** Backend, Frontend
  - **세부 작업:** 엑셀 업로드 API 구현, 파일 업로드 UI 개발
- **US-003: 대시보드 조회**
  - **담당:** Backend, Frontend
  - **세부 작업:** 대시보드 데이터 조회 API 구현, 시각화 차트 컴포넌트 개발
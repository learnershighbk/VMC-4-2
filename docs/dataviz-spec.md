# 시각화 컴포넌트 명세서 (Data Visualization Specification)

> 이 문서는 `docs/api.md`를 통해 제공되는 데이터를 사용하여 대시보드에 렌더링될 각 시각화 컴포넌트를 상세히 정의합니다.
>
> **기반 문서:** `docs/prd.md`, `docs/dataflow.md`, `docs/api.md`

---

## 1. 메인 대시보드 (Overview Dashboard)

### 컴포넌트 1: 실적 KPI 카드

- **component_id:** `performance-kpi-card`
- **title:** "실적"
- **chart_type:** `KPI Card` (단일 수치 + 트렌드 인디케이터)
- **description:** 최신 실적 지표(예: 평균 취업률)를 한눈에 파악하고 트렌드 방향을 확인합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/overview`
  - Data Key: `data.performance`
- **data_mapping:**
  - **Value:** `value` 필드 (숫자)
  - **Unit:** `unit` 필드 (예: "%")
  - **Trend:** `trend` 필드 (`"up"`, `"down"`, `"stable"`)
  - **Label:** `label` 필드 (예: "실적")
- **표시 위치:** 메인 대시보드 (`/`) 상단 4개 카드 중 첫 번째

### 컴포넌트 2: 논문 KPI 카드

- **component_id:** `papers-kpi-card`
- **title:** "논문"
- **chart_type:** `KPI Card` (단일 수치 + 트렌드 인디케이터)
- **description:** 최신 논문 게재 수를 한눈에 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/overview`
  - Data Key: `data.papers`
- **data_mapping:**
  - **Value:** `value` 필드 (숫자)
  - **Unit:** `unit` 필드 (예: "건")
  - **Trend:** `trend` 필드
  - **Label:** `label` 필드 (예: "논문")
- **표시 위치:** 메인 대시보드 (`/`) 상단 4개 카드 중 두 번째

### 컴포넌트 3: 학생 KPI 카드

- **component_id:** `students-kpi-card`
- **title:** "학생"
- **chart_type:** `KPI Card` (단일 수치 + 트렌드 인디케이터)
- **description:** 최신 총 학생 수를 한눈에 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/overview`
  - Data Key: `data.students`
- **data_mapping:**
  - **Value:** `value` 필드 (숫자)
  - **Unit:** `unit` 필드 (예: "명")
  - **Trend:** `trend` 필드
  - **Label:** `label` 필드 (예: "학생")
- **표시 위치:** 메인 대시보드 (`/`) 상단 4개 카드 중 세 번째

### 컴포넌트 4: 예산 KPI 카드

- **component_id:** `budget-kpi-card`
- **title:** "예산"
- **chart_type:** `KPI Card` (단일 수치 + 트렌드 인디케이터)
- **description:** 최신 예산 집행률을 한눈에 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/overview`
  - Data Key: `data.budget`
- **data_mapping:**
  - **Value:** `value` 필드 (숫자)
  - **Unit:** `unit` 필드 (예: "%")
  - **Trend:** `trend` 필드
  - **Label:** `label` 필드 (예: "예산")
- **표시 위치:** 메인 대시보드 (`/`) 상단 4개 카드 중 네 번째

---

## 2. 실적 대시보드 (Performance Dashboard)

### 컴포넌트 5: 학과별 취업률

- **component_id:** `department-employment-rates`
- **title:** "학과별 취업률"
- **chart_type:** `Horizontal Bar Chart`
- **description:** 학과별 취업률을 비교하여 각 학과의 취업 성과를 직관적으로 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/performance`
  - Data Key: `data.employment_rates`
- **data_mapping:**
  - **Y-Axis (세로축):** `department` 필드 (학과명)
  - **X-Axis (가로축):** `employment_rate` 필드 (%)
  - **Bar Fill Color:** `#10b981` (녹색 계열)
  - **Group By:** `college` 필드로 색상 구분 (선택적)
  - **Sorting:** 취업률 기준 내림차순 정렬 권장
  - **Tooltip:** 학과명, 단과대학, 취업률(%) 표시
- **표시 위치:** 실적 대시보드 (`/dashboard/performance`) 첫 번째 차트 영역

### 컴포넌트 6: 기술이전 수입 추이

- **component_id:** `tech-transfer-revenue-trend`
- **title:** "연도별 기술이전 수입 추이"
- **chart_type:** `Line Chart` (Multi-line)
- **description:** 학과별 연도별 기술이전 수입액의 변화 추이를 시각화하여 성장 동향을 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/performance`
  - Data Key: `data.tech_transfer_revenue`
- **data_mapping:**
  - **X-Axis (가로축):** `evaluation_year` 필드 (연도)
  - **Y-Axis (세로축):** `revenue` 필드 (억원)
  - **Series:** `department` 필드별로 라인 구분 (각 학과마다 별도 라인)
  - **Legend:** 학과명 목록 표시
  - **Tooltip:** 연도, 학과, 수입액(억원) 표시
  - **Color Palette:** 학과별로 서로 다른 색상 자동 할당
- **표시 위치:** 실적 대시보드 (`/dashboard/performance`) 두 번째 차트 영역

### 컴포넌트 7: 학과별 교원 현황

- **component_id:** `faculty-status`
- **title:** "학과별 교원 현황"
- **chart_type:** `Grouped Bar Chart`
- **description:** 학과별 전임교원과 초빙교원 수를 비교하여 교원 구성 현황을 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/performance`
  - Data Key: `data.faculty_status`
- **data_mapping:**
  - **X-Axis (가로축):** `department` 필드 (학과명)
  - **Y-Axis (세로축):** 교원 수 (명)
  - **Group 1:** `fulltime_count` (전임교원, 색상: `#3b82f6` 파랑)
  - **Group 2:** `visiting_count` (초빙교원, 색상: `#f59e0b` 주황)
  - **Legend:** 전임교원, 초빙교원 구분 표시
  - **Tooltip:** 학과명, 전임교원 수, 초빙교원 수 표시
- **표시 위치:** 실적 대시보드 (`/dashboard/performance`) 세 번째 차트 영역

### 컴포넌트 8: 국제학술대회 개최 횟수

- **component_id:** `intl-conference-count`
- **title:** "연도별 국제학술대회 개최 횟수"
- **chart_type:** `Bar Chart`
- **description:** 학과별 연도별 국제학술대회 개최 횟수를 비교하여 학술 활동 현황을 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/performance`
  - Data Key: `data.intl_conference_count`
- **data_mapping:**
  - **X-Axis (가로축):** `evaluation_year` 필드 (연도)
  - **Y-Axis (세로축):** `count` 필드 (횟수)
  - **Group By:** `department` 필드로 그룹화 (학과별 막대)
  - **Bar Fill Color:** 학과별로 서로 다른 색상
  - **Legend:** 학과명 목록 표시
  - **Tooltip:** 연도, 학과, 개최 횟수 표시
- **표시 위치:** 실적 대시보드 (`/dashboard/performance`) 네 번째 차트 영역

---

## 3. 논문 대시보드 (Papers Dashboard)

### 컴포넌트 9: 저널 등급별 분포

- **component_id:** `journal-grade-distribution`
- **title:** "저널 등급별 논문 분포"
- **chart_type:** `Pie Chart` 또는 `Doughnut Chart`
- **description:** 논문의 저널 등급(SCIE, KCI, 일반)별 분포를 파이 차트로 표현하여 연구 품질 구성을 한눈에 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/papers`
  - Data Key: `data.journal_grade_distribution`
- **data_mapping:**
  - **Sector Label:** `journal_grade` 필드 (SCIE, KCI, 일반)
  - **Sector Value:** `count` 필드 (논문 수)
  - **Color Palette:** 
    - SCIE: `#ef4444` (빨강)
    - KCI: `#3b82f6` (파랑)
    - 일반: `#94a3b8` (회색)
  - **Tooltip:** 등급명, 논문 수, 전체 대비 비율(%) 표시
- **표시 위치:** 논문 대시보드 (`/dashboard/papers`) 첫 번째 차트 영역

### 컴포넌트 10: 학과별 논문 게재 수

- **component_id:** `publication-by-department`
- **title:** "학과별 논문 게재 수"
- **chart_type:** `Bar Chart`
- **description:** 학과별 논문 게재 수를 비교하여 연구 성과를 학과 간 비교할 수 있도록 합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/papers`
  - Data Key: `data.publication_by_department`
- **data_mapping:**
  - **X-Axis (가로축):** `department` 필드 (학과명)
  - **Y-Axis (세로축):** `paper_count` 필드 (논문 수)
  - **Bar Fill Color:** `#8b5cf6` (보라색 계열)
  - **Sorting:** 논문 수 기준 내림차순 정렬 권장
  - **Tooltip:** 학과명, 논문 수 표시
- **표시 위치:** 논문 대시보드 (`/dashboard/papers`) 두 번째 차트 영역

### 컴포넌트 11: 논문 게재 추이

- **component_id:** `publication-trend`
- **title:** "월별 논문 게재 추이"
- **chart_type:** `Line Chart` 또는 `Area Chart`
- **description:** 시간에 따른 논문 게재 수의 변화 추이를 시각화하여 연구 활동의 변동을 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/papers`
  - Data Key: `data.publication_trend`
- **data_mapping:**
  - **X-Axis (가로축):** `year`와 `month` 필드를 결합하여 "YYYY-MM" 형식으로 표시
  - **Y-Axis (세로축):** `count` 필드 (논문 수)
  - **Tooltip:** 연도-월, 논문 수 표시
  - **Chart Type:** Line Chart 권장 (시간 추이 강조)
- **표시 위치:** 논문 대시보드 (`/dashboard/papers`) 세 번째 차트 영역

---

## 4. 학생 대시보드 (Students Dashboard)

### 컴포넌트 12: 학과별 학생 수

- **component_id:** `students-by-department`
- **title:** "학과별 학생 수"
- **chart_type:** `Bar Chart`
- **description:** 학과별 학생 수를 비교하여 학과 규모를 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/students`
  - Data Key: `data.students_by_department`
- **data_mapping:**
  - **X-Axis (가로축):** `department` 필드 (학과명)
  - **Y-Axis (세로축):** `student_count` 필드 (학생 수)
  - **Bar Fill Color:** `#06b6d4` (청록색 계열)
  - **Group By:** `college` 필드로 색상 구분 (선택적)
  - **Sorting:** 학생 수 기준 내림차순 정렬 권장
  - **Tooltip:** 학과명, 단과대학, 학생 수 표시
- **표시 위치:** 학생 대시보드 (`/dashboard/students`) 첫 번째 차트 영역

### 컴포넌트 13: 과정별 학생 분포

- **component_id:** `students-by-program`
- **title:** "과정별 학생 분포"
- **chart_type:** `Pie Chart` 또는 `Doughnut Chart`
- **description:** 학사, 석사, 박사 과정별 학생 수의 분포를 시각화합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/students`
  - Data Key: `data.students_by_program`
- **data_mapping:**
  - **Sector Label:** `program_type` 필드 (학사, 석사, 박사)
  - **Sector Value:** `student_count` 필드 (학생 수)
  - **Color Palette:** 
    - 학사: `#3b82f6` (파랑)
    - 석사: `#8b5cf6` (보라)
    - 박사: `#f59e0b` (주황)
  - **Tooltip:** 과정명, 학생 수, 전체 대비 비율(%) 표시
- **표시 위치:** 학생 대시보드 (`/dashboard/students`) 두 번째 차트 영역

### 컴포넌트 14: 학적상태별 학생 통계

- **component_id:** `academic-status-statistics`
- **title:** "학적상태별 학생 통계"
- **chart_type:** `Grouped Bar Chart`
- **description:** 재학, 휴학, 졸업 등 학적상태별 학생 수를 비교하여 학생 현황을 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/students`
  - Data Key: `data.academic_status_statistics`
- **data_mapping:**
  - **X-Axis (가로축):** `academic_status` 필드 (재학, 휴학, 졸업, 제적)
  - **Y-Axis (세로축):** `student_count` 필드 (학생 수)
  - **Bar Fill Color:** 
    - 재학: `#10b981` (녹색)
    - 휴학: `#f59e0b` (주황)
    - 졸업: `#6366f1` (남색)
    - 제적: `#ef4444` (빨강)
  - **Label:** 각 바 위에 학생 수 텍스트 표시
  - **Tooltip:** 학적상태, 학생 수 표시
- **표시 위치:** 학생 대시보드 (`/dashboard/students`) 세 번째 차트 영역

---

## 5. 예산 대시보드 (Budget Dashboard)

### 컴포넌트 15: 연구비 집행 현황

- **component_id:** `research-budget-execution`
- **title:** "연구비 집행 현황"
- **chart_type:** `Area Chart` 또는 `Line Chart`
- **description:** 시간에 따른 연구비 집행 금액의 추이를 시각화하여 예산 집행 패턴을 파악합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/budget`
  - Data Key: `data.research_budget_execution`
- **data_mapping:**
  - **X-Axis (가로축):** `execution_date` 필드 (날짜, YYYY-MM-DD 형식)
  - **Y-Axis (세로축):** `expense_amount` 필드 (원, 천 단위로 표시 권장)
  - **Chart Type:** Area Chart 권장 (시간 추이 강조)
  - **Tooltip:** 집행일자, 집행금액(원) 표시
  - **Color:** `#3b82f6` (파랑 계열)
- **표시 위치:** 예산 대시보드 (`/dashboard/budget`) 첫 번째 차트 영역

### 컴포넌트 16: 지원기관별 연구비 분포

- **component_id:** `funding-agency-distribution`
- **title:** "지원기관별 연구비 분포"
- **chart_type:** `Horizontal Bar Chart` (집행률 표시 포함)
- **description:** 지원기관별 총 연구비와 집행 금액을 비교하여 집행률을 함께 표시합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/budget`
  - Data Key: `data.funding_agency_distribution`
- **data_mapping:**
  - **Y-Axis (세로축):** `funding_agency` 필드 (지원기관명)
  - **X-Axis (가로축):** 연구비 (원, 억 단위로 표시 권장)
  - **Bar 1 (배경):** `total_budget` (총 연구비, 배경색: `#e5e7eb` 회색)
  - **Bar 2 (전경):** `executed_amount` (집행 금액, 색상: `#10b981` 녹색)
  - **Label:** 각 바 위에 집행률(%) 표시 (집행금액/총연구비 * 100)
  - **Tooltip:** 지원기관명, 총 연구비, 집행 금액, 집행률(%) 표시
- **표시 위치:** 예산 대시보드 (`/dashboard/budget`) 두 번째 차트 영역

### 컴포넌트 17: 과제별 집행률

- **component_id:** `project-execution-rates`
- **title:** "과제별 집행률"
- **chart_type:** `Horizontal Bar Chart` 또는 `Progress Bar Chart`
- **description:** 각 연구과제별 예산 집행률을 비교하여 집행 현황을 모니터링합니다.
- **data_source:**
  - API Endpoint: `GET /api/dashboard/budget`
  - Data Key: `data.project_execution_rates`
- **data_mapping:**
  - **Y-Axis (세로축):** `project_name` 필드 (과제명) 또는 `project_number` 필드 (과제번호)
  - **X-Axis (가로축):** `execution_rate` 필드 (%)
  - **Bar Fill Color:** 집행률에 따라 그라데이션 적용
    - 0-50%: `#ef4444` (빨강)
    - 50-80%: `#f59e0b` (노랑)
    - 80-100%: `#10b981` (녹색)
  - **Label:** 각 바 끝에 집행률(%) 텍스트 표시
  - **Tooltip:** 과제명(또는 번호), 총 연구비, 집행 금액, 집행률(%) 표시
- **표시 위치:** 예산 대시보드 (`/dashboard/budget`) 세 번째 차트 영역

---

## 6. 공통 사항

### 6.1 차트 라이브러리
- **권장 라이브러리:** Recharts (React 기반)
- **대안:** Chart.js, Victory 등

### 6.2 반응형 디자인
- **데스크톱 (1024px+):** 2x2 Grid 레이아웃 (차트 4개)
- **태블릿 (768px-1023px):** 1x2 또는 2x1 레이아웃
- **모바일 (<768px):** 1x1 레이아웃 (차트를 세로로 스택)

### 6.3 로딩 상태
- 모든 차트는 데이터 로딩 중 스켈레톤 UI 표시
- 로딩 실패 시 오류 메시지 및 재시도 버튼 제공

### 6.4 빈 데이터 처리
- 데이터가 없는 경우 빈 상태(Empty State) UI 표시
- "데이터가 없습니다" 메시지 및 업로드 안내 (관리자만)

### 6.5 필터 연동
- 각 대시보드의 필터 변경 시 해당 차트만 리렌더링 (React Query 캐시 무효화)
- 필터링된 데이터로 자동 업데이트

---

**문서 버전:** 1.0  
**작성일:** 2025-01-XX  
**작성자:** dataviz-designer 에이전트  
**기반 문서:** `docs/prd.md`, `docs/dataflow.md`, `docs/api.md`

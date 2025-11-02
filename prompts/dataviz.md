# 시각화 컴포넌트 명세서 (Data Visualization Specification)

> 이 문서는 `docs/api.md`를 통해 제공되는 데이터를 사용하여 대시보드에 렌더링될 각 시각화 컴포넌트를 상세히 정의합니다.

---

## 컴포넌트 1: 월별 실적 추이

-   **component_id:** `performance-trend-chart`
-   **title:** "월별 실적 추이"
-   **chart_type:** `Line Chart`
-   **description:** 시간에 따른 실적 변화를 시각적으로 보여주어 성과 추이를 직관적으로 파악할 수 있도록 합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `performance_trend`
-   **data_mapping:**
    -   **X-Axis (가로축):** `metric_date` 필드 (YYYY-MM 형식으로 표시)
    -   **Y-Axis (세로축):** `performance` 필드
    -   **Tooltip (툴팁):** 마우스 호버 시 해당 월의 `performance` 값 표시

## 컴포넌트 2: 월별 논문 게재 수

-   **component_id:** `paper-count-chart`
-   **title:** "월별 논문 게재 수"
-   **chart_type:** `Bar Chart`
-   **description:** 월별 논문 게재 수를 막대 그래프로 비교하여 연구 성과의 변동을 쉽게 파악할 수 있도록 합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `paper_trend`
-   **data_mapping:**
    -   **X-Axis (가로축):** `metric_date` 필드 (YYYY-MM 형식으로 표시)
    -   **Y-Axis (세로축):** `paper_count` 필드
    -   **Bar Fill Color:** `#8884d8`

## 컴포넌트 3: 최신 월 총 학생 수

-   **component_id:** `total-students-kpi`
-   **title:** "최신 월 총 학생 수"
-   **chart_type:** `KPI Card (Single Number Display)`
-   **description:** 가장 최근 데이터 기준의 총 학생 수를 강조하여 핵심 지표를 한눈에 파악할 수 있도록 합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `student_summary` 배열의 마지막 요소
-   **data_mapping:**
    -   **Value:** `student_count` 필드
    -   **Label:** `metric_date` 필드 (YYYY년 MM월 기준)

---

## 컴포넌트 4: 학과별 취업률

-   **component_id:** `department-employment-rates`
-   **title:** "학과별 취업률"
-   **chart_type:** `Bar Chart` (가로형)
-   **description:** 학과별 취업률을 비교하여 각 학과의 취업 성과를 직관적으로 파악할 수 있도록 합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `department_employment_rates`
-   **data_mapping:**
    -   **X-Axis (가로축):** `employment_rate` 필드 (%)
    -   **Y-Axis (세로축):** `department` 필드 (학과명)
    -   **Bar Fill Color:** `#10b981` (녹색 계열)
    -   **Group By:** `college` 필드로 색상 구분 (선택적)

---

## 컴포넌트 5: 기술이전 수입 추이

-   **component_id:** `tech-transfer-revenue-trend`
-   **title:** "연도별 기술이전 수입 추이"
-   **chart_type:** `Line Chart` (Multi-line)
-   **description:** 학과별 연도별 기술이전 수입액의 변화 추이를 시각화하여 성장 동향을 파악합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `tech_transfer_revenue_trend`
-   **data_mapping:**
    -   **X-Axis (가로축):** `evaluation_year` 필드 (연도)
    -   **Y-Axis (세로축):** `revenue` 필드 (억원)
    -   **Series:** `department` 필드별로 라인 구분
    -   **Tooltip:** 마우스 호버 시 연도, 학과, 수입액 표시

---

## 컴포넌트 6: 교원 현황

-   **component_id:** `faculty-status`
-   **title:** "학과별 교원 현황"
-   **chart_type:** `Grouped Bar Chart`
-   **description:** 학과별 전임교원과 초빙교원 수를 비교하여 교원 구성 현황을 파악합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `faculty_status`
-   **data_mapping:**
    -   **X-Axis (가로축):** `department` 필드 (학과명)
    -   **Y-Axis (세로축):** 교원 수 (명)
    -   **Group 1:** `fulltime_count` (전임교원, 색상: `#3b82f6`)
    -   **Group 2:** `visiting_count` (초빙교원, 색상: `#f59e0b`)
    -   **Legend:** 전임교원, 초빙교원 구분 표시

---

## 컴포넌트 7: 저널 등급별 분포

-   **component_id:** `journal-grade-distribution`
-   **title:** "저널 등급별 논문 분포"
-   **chart_type:** `Pie Chart` 또는 `Doughnut Chart`
-   **description:** 논문의 저널 등급(SCIE, KCI, 일반)별 분포를 파이 차트로 표현하여 연구 품질 구성을 한눈에 파악합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `journal_grade_distribution`
-   **data_mapping:**
    -   **Sector Label:** `journal_grade` 필드
    -   **Sector Value:** `count` 필드
    -   **Color Palette:** SCIE: `#ef4444` (빨강), KCI: `#3b82f6` (파랑), 일반: `#94a3b8` (회색)
    -   **Tooltip:** 등급명과 논문 수 표시

---

## 컴포넌트 8: 학과별 논문 현황

-   **component_id:** `publication-by-department`
-   **title:** "학과별 논문 게재 수"
-   **chart_type:** `Bar Chart`
-   **description:** 학과별 논문 게재 수를 비교하여 연구 성과를 학과 간 비교할 수 있도록 합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `publication_by_department`
-   **data_mapping:**
    -   **X-Axis (가로축):** `department` 필드 (학과명)
    -   **Y-Axis (세로축):** `paper_count` 필드
    -   **Bar Fill Color:** `#8b5cf6` (보라색 계열)
    -   **Sorting:** 논문 수 기준 내림차순 정렬 권장

---

## 컴포넌트 9: 연구비 집행 현황

-   **component_id:** `research-budget-execution`
-   **title:** "연구비 집행 현황"
-   **chart_type:** `Area Chart` 또는 `Stacked Bar Chart`
-   **description:** 시간에 따른 연구비 집행 금액의 추이를 시각화하여 예산 집행 패턴을 파악합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `research_budget_execution`
-   **data_mapping:**
    -   **X-Axis (가로축):** `execution_date` 필드 (날짜, YYYY-MM-DD 형식)
    -   **Y-Axis (세로축):** `expense_amount` 필드 (원)
    -   **Chart Type:** Area Chart 권장 (시간 추이 강조)
    -   **Tooltip:** 집행일자와 집행금액 표시

---

## 컴포넌트 10: 지원기관별 분포

-   **component_id:** `funding-agency-distribution`
-   **title:** "지원기관별 연구비 분포"
-   **chart_type:** `Horizontal Bar Chart` (집행률 표시 포함)
-   **description:** 지원기관별 총 연구비와 집행 금액을 비교하여 집행률을 함께 표시합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `funding_agency_distribution`
-   **data_mapping:**
    -   **Y-Axis (세로축):** `funding_agency` 필드 (지원기관명)
    -   **X-Axis (가로축):** 연구비 (원)
    -   **Bar 1:** `total_budget` (총 연구비, 배경색: `#e5e7eb`)
    -   **Bar 2:** `executed_amount` (집행 금액, 색상: `#10b981`)
    -   **Label:** 각 바 위에 집행률(%) 표시 (집행금액/총연구비 * 100)

---

## 컴포넌트 11: 과제별 집행률

-   **component_id:** `project-execution-rates`
-   **title:** "과제별 집행률"
-   **chart_type:** `Progress Bar Chart` 또는 `Horizontal Bar Chart`
-   **description:** 각 연구과제별 예산 집행률을 비교하여 집행 현황을 모니터링합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `project_execution_rates`
-   **data_mapping:**
    -   **Y-Axis (세로축):** `project_name` 필드 (과제명) 또는 `project_number` 필드 (과제번호)
    -   **X-Axis (가로축):** `execution_rate` 필드 (%)
    -   **Bar Fill Color:** 집행률에 따라 그라데이션 적용 (0-50%: 빨강, 50-80%: 노랑, 80-100%: 녹색)
    -   **Label:** 각 바 끝에 집행률(%) 텍스트 표시

---

## 컴포넌트 12: 학과별 학생 수

-   **component_id:** `students-by-department`
-   **title:** "학과별 학생 수"
-   **chart_type:** `Bar Chart`
-   **description:** 학과별 학생 수를 비교하여 학과 규모를 파악합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `students_by_department`
-   **data_mapping:**
    -   **X-Axis (가로축):** `department` 필드 (학과명)
    -   **Y-Axis (세로축):** `student_count` 필드
    -   **Bar Fill Color:** `#06b6d4` (청록색 계열)
    -   **Group By:** `college` 필드로 색상 구분 (선택적)
    -   **Sorting:** 학생 수 기준 내림차순 정렬 권장

---

## 컴포넌트 13: 과정별 학생 분포

-   **component_id:** `students-by-program`
-   **title:** "과정별 학생 분포"
-   **chart_type:** `Pie Chart` 또는 `Doughnut Chart`
-   **description:** 학사, 석사, 박사 과정별 학생 수의 분포를 시각화합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `students_by_program`
-   **data_mapping:**
    -   **Sector Label:** `program_type` 필드 (학사, 석사, 박사)
    -   **Sector Value:** `student_count` 필드
    -   **Color Palette:** 학사: `#3b82f6` (파랑), 석사: `#8b5cf6` (보라), 박사: `#f59e0b` (주황)
    -   **Tooltip:** 과정명과 학생 수, 전체 대비 비율(%) 표시

---

## 컴포넌트 14: 학적상태 통계

-   **component_id:** `academic-status-statistics`
-   **title:** "학적상태별 학생 통계"
-   **chart_type:** `Stacked Bar Chart` 또는 `Grouped Bar Chart`
-   **description:** 재학, 휴학, 졸업 등 학적상태별 학생 수를 비교하여 학생 현황을 파악합니다.
-   **data_source:**
    -   API Endpoint: `GET /api/dashboard/metrics`
    -   Data Key: `academic_status_statistics`
-   **data_mapping:**
    -   **X-Axis (가로축):** `academic_status` 필드 (재학, 휴학, 졸업)
    -   **Y-Axis (세로축):** `student_count` 필드
    -   **Bar Fill Color:** 재학: `#10b981` (녹색), 휴학: `#f59e0b` (주황), 졸업: `#6366f1` (남색)
    -   **Label:** 각 바 위에 학생 수 텍스트 표시


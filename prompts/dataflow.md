# 데이터 흐름 명세서 (Data Flow Specification)

> 이 문서는 Ecount CSV 파일이 시스템에 입력되어 사용자에게 대시보드로 시각화되기까지의 전체 데이터 파이프라인을 정의합니다.
>
> **참고:** 실제 CSV 파일 구조는 `docs/csv-sample.md`에 명세되어 있습니다. 본 문서는 데이터 처리 흐름에 초점을 맞추며, 상세한 CSV 구조 정의는 `docs/csv-sample.md`를 참조하세요.

## 1. 전체 흐름도 (Overall Flow Diagram)

```mermaid
graph TD
    subgraph "User Domain"
        A[User] -- 1. Uploads --> F[Ecount CSV File (.csv)];
    end

    subgraph "System Boundary (Railway.app)"
        F -- 2. Ingestion --> B[Backend: Django REST Framework];
        B -- 3. Processing (Parse & Validate) --> B;
        B -- 4. Storage --> C[Database: PostgreSQL on Railway];
        C -- 5. Serving --> B;
        B -- 6. API Response --> D[Frontend: SuperNext];
    end

    subgraph "User Domain"
         D -- 7. Renders --> E[Dashboard Visualization];
    end
```

## 2. 단계별 상세 설명 (Step-by-Step Description)

### 2.1. 수집 (Ingestion)
- **설명:** 사용자가 업로드한 원본 CSV 파일을 시스템이 수신하는 단계입니다.
- **원본 데이터 소스:** Ecount 시스템에서 추출한 `.csv` 파일
- **파일 종류:** 시스템은 다음 4개의 CSV 파일을 처리합니다:
  - `department_kpi.csv`: 학과별 연도별 주요 성과 지표 (KPI)
  - `publication_list.csv`: 논문 게재 현황
  - `research_project_data.csv`: 연구과제 예산 집행 데이터
  - `student_roster.csv`: 학생 명부 (학부생, 대학원생)
- **데이터 구조:** 각 CSV 파일의 상세 구조는 `docs/csv-sample.md`에 명세되어 있습니다. (컬럼명, 데이터 타입, 필수 여부, 제약 조건 등)

### 2.2. 처리 (Processing)
- **설명:** 수집된 원본 데이터를 정제하고, 유효성을 검사하여 데이터베이스에 저장할 수 있는 형태로 가공하는 단계입니다.
- **파싱 로직:**
  - 백엔드(Python)의 `Pandas` 라이브러리를 사용하여 CSV 파일을 DataFrame으로 읽어들입니다.
  - UTF-8 with BOM 인코딩을 지원하여 한글 데이터를 올바르게 처리합니다.
  - `pandas.read_csv()` 함수를 사용하여 각 CSV 파일의 헤더 행을 자동으로 인식하고 데이터 행을 읽어들입니다.
- **데이터 변환:**
  - 날짜 형식 컬럼(`year_month` 등)을 Pandas의 `pd.to_datetime()`을 사용하여 표준 날짜 타입으로 변환합니다.
  - 각 수치 데이터의 불필요한 공백이나 문자를 제거하고 숫자 타입으로 변환합니다 (`pd.to_numeric()` 사용).
  - 문자열 데이터는 Pandas의 `.str.strip()` 메서드를 사용하여 앞뒤 공백을 제거합니다.
- **유효성 검증:**
  - Django REST Framework Serializer를 사용하여 각 행의 데이터 유효성을 검증합니다.
  - `docs/data-validation.md`에 정의된 규칙에 따라 검증을 수행합니다. 검증 규칙은 `docs/csv-sample.md`에 명시된 실제 CSV 구조를 기반으로 작성됩니다.
  - 필수 컬럼 누락, 타입 불일치, 범위 초과 등을 검사합니다.
  - Django Serializer의 `is_valid()` 메서드를 통해 검증을 수행하고, 에러는 `serializer.errors`에서 확인합니다.
- **오류 처리:**
  - 유효성 검증에 실패한 행은 Django 로깅 시스템을 통해 로그를 남기고, 해당 행을 제외한 나머지 데이터만 처리합니다.
  - 파일 전체를 거부하지 않고, 처리 가능한 행만 Django ORM을 통해 데이터베이스에 저장합니다.
  - Django ORM의 `bulk_create()` 또는 트랜잭션을 사용하여 효율적으로 데이터를 저장합니다.
  - 처리 결과(성공 행 수, 실패 행 수)를 API 응답에 포함하여 사용자에게 피드백을 제공합니다.

### 2.3. 저장 (Storage)
- **설명:** 처리된 데이터를 영구적으로 보관하기 위해 데이터베이스에 저장하는 단계입니다.
- **대상 데이터베이스:** PostgreSQL (Railway)
- **저장 방식:**
  - Django ORM을 사용하여 데이터베이스에 접근합니다.
  - `Model.objects.bulk_create()`를 사용한 배치 삽입으로 성능을 최적화합니다.
  - Django의 `transaction.atomic()`을 사용하여 트랜잭션으로 데이터 일관성을 보장합니다.
- **데이터 모델링 개념:**
  - CSV 파일별로 대응하는 Django Model이 존재합니다 (예: `DepartmentKPI`, `PublicationList`, `ResearchProjectData`, `StudentRoster`).
  - 각 Model은 `docs/database.md`에 정의된 스키마를 따릅니다. 스키마는 `docs/csv-sample.md`의 실제 CSV 구조를 반영하여 설계됩니다.
  - Primary Key 중복 시 `get_or_create()`, `update_or_create()` 메서드를 사용하여 기존 데이터를 업데이트하거나 건너뛰는 전략을 적용합니다. (Primary Key 정의는 `docs/csv-sample.md`의 "파일 간 관계" 섹션 참조)

### 2.4. 제공 (Serving)
- **설명:** 저장된 데이터를 프론트엔드의 요청에 따라 API를 통해 제공하는 단계입니다.
- **API 제공 형태:**
  - 프론트엔드의 시각화 라이브러리(Recharts)가 직접 사용할 수 있는 JSON 배열 형태로 데이터를 가공하여 제공합니다.
  - 예시 (`GET /api/dashboard/performance_trend`):
    ```json
    [
      { "name": "2024-01", "performance": 1200 },
      { "name": "2024-02", "performance": 1500 }
    ]
    ```
- **데이터 가공:**
  - 프론트엔드의 부담을 줄이기 위해, 기간별 집계(Aggregation)나 정렬은 백엔드에서 미리 처리하여 API 응답에 포함합니다.

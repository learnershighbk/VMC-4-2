# REST API 명세서 (REST API Specification)

> 이 문서는 프론트엔드와 백엔드 간의 모든 통신 계약을 정의합니다.

## 1. 공통 사항 (Common Information)

- **Base URL:** `/api`
- **Backend Architecture:** Django REST Framework
- **Request Validation:** Django REST Framework Serializers를 사용한 요청 검증
- **Response Format:** Django REST Framework 표준 응답 형식
- **Authentication:**
  - 모든 인증이 필요한 요청은 `Authorization` 헤더에 `Bearer <ACCESS_TOKEN>`을 포함해야 합니다.
  - JWT 토큰 기반 인증을 사용합니다.
  - 토큰이 만료된 경우, `POST /api/auth/token/refresh` 엔드포인트를 사용하여 재발급 받아야 합니다.
- **Error Response Format:**
  ```json
  {
    "detail": "Error message explaining the issue."
  }
  ```
  또는 필드별 에러:
  ```json
  {
    "field_name": ["Error message for this field."]
  }
  ```
- **Success Response Format:**
  ```json
  {
    "id": "...",
    "name": "...",
    // ... 기타 데이터 필드
  }
  ```

---

## 2. 인증 (Authentication)

### `POST /api/auth/token`
- **Description:** 사용자가 아이디와 비밀번호로 로그인하여 JWT Access/Refresh 토큰을 발급받습니다.
- **Django View:** `APIView` 또는 `ViewSet` 기반 구현
- **Request Body:** `application/json`
  ```json
  {
    "username": "admin",
    "password": "securepassword123"
  }
  ```
- **Request Validation (Django Serializer):**
  ```python
  class TokenObtainPairSerializer(serializers.Serializer):
      username = serializers.CharField(required=True)
      password = serializers.CharField(required=True, write_only=True)
  ```
- **Response (200 OK):**
  ```json
  {
    "access": "eyJhbGciOiJI...",
    "refresh": "eyJhbGciOi..."
  }
  ```
- **Response (401 Unauthorized):**
  ```json
  {
    "detail": "No active account found with the given credentials"
  }
  ```

---

## 3. 데이터 (Data)

### `POST /api/data/upload`
- **Description:** 관리자가 Ecount CSV 파일을 업로드합니다. 인증이 필요합니다.
- **Django View:** `APIView` 또는 `ViewSet` 기반 구현
- **Request Body:** `multipart/form-data`
  - **Key:** `file`
  - **Value:** The `.csv` file to be uploaded.
- **Request Validation:**
  - 파일 형식: `.csv`만 허용 (Django FileField validation)
  - 파일 크기: 최대 100MB (Django settings에서 설정)
  - 파일 인코딩: UTF-8 with BOM
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "File processed successfully.",
    "processed_rows": 50,
    "failed_rows": 2
  }
  ```
- **Response (400 Bad Request):**
  - 파일 형식이 잘못되었거나, 내부 데이터 파싱에 실패한 경우.
  ```json
  {
    "detail": "Invalid file format or corrupt data."
  }
  ```
  또는:
  ```json
  {
    "file": ["Only CSV files are allowed."]
  }
  ```
- **Response (401 Unauthorized):**
  - 인증 토큰이 없거나 유효하지 않은 경우.

---

## 4. 대시보드 (Dashboard)

### `GET /api/dashboard/metrics`
- **Description:** 대시보드 시각화에 필요한 모든 지표 데이터를 조회합니다. 인증이 필요합니다.
- **Django View:** `APIView` 또는 `ViewSet` 기반 구현
- **Query Parameters (Optional):**
  - `start_date` (YYYY-MM-DD): 조회 시작일
  - `end_date` (YYYY-MM-DD): 조회 종료일
  - `evaluation_year` (YYYY): 평가년도 필터 (학과 KPI 관련 지표에 사용)
- **Query Validation (Django Serializer):**
  ```python
  class MetricsQuerySerializer(serializers.Serializer):
      start_date = serializers.DateField(required=False, format='%Y-%m-%d')
      end_date = serializers.DateField(required=False, format='%Y-%m-%d')
      evaluation_year = serializers.IntegerField(required=False)
  ```
- **Response (200 OK):**
  ```json
  {
    "performance_trend": [
      { "metric_date": "2024-01-01", "performance": 1200 },
      { "metric_date": "2024-02-01", "performance": 1500 }
    ],
    "paper_trend": [
      { "metric_date": "2024-01-01", "paper_count": 10 },
      { "metric_date": "2024-02-01", "paper_count": 12 }
    ],
    "student_summary": [
      { "metric_date": "2024-01-01", "student_count": 500 },
      { "metric_date": "2024-02-01", "student_count": 510 }
    ],
    "department_employment_rates": [
      { "department": "컴퓨터공학과", "college": "공과대학", "employment_rate": 85.5 },
      { "department": "전자공학과", "college": "공과대학", "employment_rate": 88.2 }
    ],
    "tech_transfer_revenue_trend": [
      { "evaluation_year": 2023, "department": "컴퓨터공학과", "revenue": 8.5 },
      { "evaluation_year": 2024, "department": "컴퓨터공학과", "revenue": 10.2 }
    ],
    "faculty_status": [
      { "department": "컴퓨터공학과", "fulltime_count": 15, "visiting_count": 4 },
      { "department": "전자공학과", "fulltime_count": 18, "visiting_count": 3 }
    ],
    "journal_grade_distribution": [
      { "journal_grade": "SCIE", "count": 25 },
      { "journal_grade": "KCI", "count": 40 },
      { "journal_grade": "일반", "count": 15 }
    ],
    "publication_by_department": [
      { "department": "컴퓨터공학과", "paper_count": 30 },
      { "department": "전자공학과", "paper_count": 25 },
      { "department": "철학과", "paper_count": 10 }
    ],
    "research_budget_execution": [
      { "execution_date": "2024-01-15", "expense_amount": 120000000 },
      { "execution_date": "2024-02-20", "expense_amount": 80000000 }
    ],
    "funding_agency_distribution": [
      { "funding_agency": "한국연구재단", "total_budget": 1500000000, "executed_amount": 1200000000 },
      { "funding_agency": "정보통신기획평가원", "total_budget": 800000000, "executed_amount": 530000000 }
    ],
    "project_execution_rates": [
      { "project_number": "NRF-2023-015", "project_name": "차세대 AI 반도체 설계", "execution_rate": 85.5 },
      { "project_number": "IITP-A-23-101", "project_name": "자율주행 시뮬레이션 고도화", "execution_rate": 66.25 }
    ],
    "students_by_department": [
      { "department": "컴퓨터공학과", "college": "공과대학", "student_count": 350 },
      { "department": "전자공학과", "college": "공과대학", "student_count": 280 }
    ],
    "students_by_program": [
      { "program_type": "학사", "student_count": 1200 },
      { "program_type": "석사", "student_count": 150 },
      { "program_type": "박사", "student_count": 50 }
    ],
    "academic_status_statistics": [
      { "academic_status": "재학", "student_count": 1250 },
      { "academic_status": "휴학", "student_count": 100 },
      { "academic_status": "졸업", "student_count": 50 }
    ]
  }
  ```
- **Response (401 Unauthorized):**
  - 인증 토큰이 없거나 유효하지 않은 경우.
  ```json
  {
    "detail": "Authentication credentials were not provided."
  }
  ```

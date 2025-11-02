# REST API 명세서 (REST API Specification)

> 이 문서는 프론트엔드와 백엔드 간의 모든 통신 계약을 정의합니다.
>
> **백엔드 아키텍처:** Django REST Framework
> **기반 문서:** `docs/prd.md`, `docs/userflow.md`, `docs/database.md`

## 1. 공통 사항 (Common Information)

- **Base URL:** `/api` (Django 백엔드 서비스 URL)
- **Backend Architecture:** Django REST Framework
- **Request Validation:** Django REST Framework Serializers를 사용한 요청 검증
- **Response Format:** JSON (Django REST Framework 표준 형식)
- **Authentication:**
  - 모든 인증이 필요한 요청은 `Authorization` 헤더에 `Bearer <ACCESS_TOKEN>`을 포함해야 합니다.
  - JWT 토큰 기반 인증을 사용합니다.
  - 토큰이 만료된 경우, `POST /api/auth/refresh` 엔드포인트를 사용하여 재발급 받을 수 있습니다.
- **Error Response Format (Django REST Framework 표준):**
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
  또는 리스트 응답:
  ```json
  [
    { "id": 1, "name": "..." },
    { "id": 2, "name": "..." }
  ]
  ```

---

## 2. 인증 (Authentication)

### `POST /api/auth/token`
- **Description:** 사용자가 아이디와 비밀번호로 로그인하여 JWT Access Token 및 Refresh Token을 발급받습니다.
- **Django View:** `djangorestframework-simplejwt`의 `TokenObtainPairView` 사용
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

### `POST /api/auth/token/refresh`
- **Description:** 만료된 Access Token을 Refresh Token으로 새로 발급받습니다.
- **Django View:** `djangorestframework-simplejwt`의 `TokenRefreshView` 사용
- **Request Body:** `application/json`
  ```json
  {
    "refresh": "eyJhbGciOiJI..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access": "eyJhbGciOiJI..."
  }
  ```
- **Response (401 Unauthorized):**
  ```json
  {
    "detail": "Token is invalid or expired"
  }
  ```

---

## 3. 데이터 업로드 (Data Upload)

### `POST /api/data/upload`
- **Description:** 관리자가 Ecount CSV 파일을 업로드합니다. 인증이 필요하며 관리자 권한이 필요합니다.
- **Django View:** `APIView` 또는 `ViewSet` 기반 구현
- **Request Body:** `multipart/form-data`
  - **Key:** `file` - CSV 파일
  - **Key:** `data_type` - 데이터 유형: `'kpi'`, `'publication'`, `'project'`, `'student'` 중 하나
- **Request Validation:**
  - 파일 형식: `.csv`만 허용 (Django FileField validation)
  - 파일 크기: 최대 100MB (Django settings에서 설정)
  - 파일 인코딩: UTF-8 with BOM
  - 데이터 유형: 필수, 허용 값: `'kpi'`, `'publication'`, `'project'`, `'student'`
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "File processed successfully.",
    "upload_id": 1,
    "total_rows": 100,
    "success_rows": 95,
    "failed_rows": 5,
    "errors": [
      {
        "row": 10,
        "reason": "필수 컬럼 누락: evaluation_year"
      },
      {
        "row": 25,
        "reason": "데이터 타입 불일치: employment_rate는 숫자여야 합니다"
      }
    ]
  }
  ```
- **Response (400 Bad Request):**
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
  ```json
  {
    "detail": "Authentication credentials were not provided."
  }
  ```
- **Response (403 Forbidden):**
  ```json
  {
    "detail": "You do not have permission to perform this action."
  }
  ```

### `GET /api/data/upload-logs`
- **Description:** 업로드 이력을 조회합니다. 인증이 필요하며 관리자 권한이 필요합니다.
- **Django View:** `APIView` 또는 `ViewSet` 기반 구현 (페이지네이션 지원)
- **Query Parameters (Optional):**
  - `page` (Integer): 페이지 번호 (기본값: 1)
  - `page_size` (Integer): 페이지당 항목 수 (기본값: 20, 최대: 100)
  - `data_type` (String): 데이터 유형 필터 (`'kpi'`, `'publication'`, `'project'`, `'student'`)
- **Response (200 OK):**
  ```json
  {
    "count": 50,
    "next": "http://api.example.com/api/data/upload-logs/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "file_name": "department_kpi.csv",
        "data_type": "kpi",
        "total_rows": 100,
        "success_rows": 95,
        "failed_rows": 5,
        "uploaded_by": {
          "id": 1,
          "username": "admin"
        },
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

### `GET /api/data/upload-logs/{id}`
- **Description:** 특정 업로드 이력의 상세 정보를 조회합니다. 인증이 필요하며 관리자 권한이 필요합니다.
- **Django View:** `APIView` 또는 `ViewSet` 기반 구현
- **Path Parameters:**
  - `id` (Integer): 업로드 로그 ID
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "file_name": "department_kpi.csv",
    "data_type": "kpi",
    "total_rows": 100,
    "success_rows": 95,
    "failed_rows": 5,
    "error_details": [
      {
        "row": 10,
        "reason": "필수 컬럼 누락: evaluation_year",
        "data": {
          "college": "공과대학",
          "department": "컴퓨터공학과"
        }
      }
    ],
    "uploaded_by": {
      "id": 1,
      "username": "admin"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
  ```

---

## 4. 대시보드 (Dashboard)

### `GET /api/dashboard/overview`
- **Description:** 메인 대시보드의 4개 주요 지표 요약 데이터를 조회합니다. 인증이 필요합니다.
- **Django View:** `APIView` 또는 `ViewSet` 기반 구현
- **Response (200 OK):**
  ```json
  {
    "performance": {
      "label": "실적",
      "value": 87.5,
      "unit": "%",
      "trend": "up"
    },
    "papers": {
      "label": "논문",
      "value": 125,
      "unit": "건",
      "trend": "up"
    },
    "students": {
      "label": "학생",
      "value": 1400,
      "unit": "명",
      "trend": "stable"
    },
    "budget": {
      "label": "예산",
      "value": 85.2,
      "unit": "%",
      "trend": "up"
    }
  }
  ```

### `GET /api/dashboard/performance`
- **Description:** 실적 대시보드 데이터를 조회합니다. 인증이 필요합니다.
- **Django View:** `APIView` 또는 `ViewSet` 기반 구현
- **Query Parameters (Optional):**
  - `evaluation_year` (Integer): 평가년도 필터 (예: 2023, 2024)
  - `college` (String): 단과대학 필터
  - `department` (String): 학과 필터
- **Response (200 OK):**
  ```json
  {
    "employment_rates": [
        {
          "department": "컴퓨터공학과",
          "college": "공과대학",
          "employment_rate": 85.5,
          "evaluation_year": 2023
        },
        {
          "department": "전자공학과",
          "college": "공과대학",
          "employment_rate": 88.2,
          "evaluation_year": 2023
        }
      ],
      "tech_transfer_revenue": [
        {
          "evaluation_year": 2023,
          "department": "컴퓨터공학과",
          "revenue": 8.5
        },
        {
          "evaluation_year": 2024,
          "department": "컴퓨터공학과",
          "revenue": 10.2
        }
      ],
      "faculty_status": [
        {
          "department": "컴퓨터공학과",
          "fulltime_count": 15,
          "visiting_count": 4
        },
        {
          "department": "전자공학과",
          "fulltime_count": 18,
          "visiting_count": 3
        }
      ],
      "intl_conference_count": [
        {
          "evaluation_year": 2023,
          "department": "컴퓨터공학과",
          "count": 2
        },
        {
          "evaluation_year": 2024,
          "department": "컴퓨터공학과",
          "count": 3
        }
      ]
    }
  }
  ```

### `GET /api/dashboard/papers`
- **Description:** 논문 게재 현황 대시보드 데이터를 조회합니다. 인증이 필요합니다.
- **Query Parameters (Optional):**
  - `start_date` (String): 조회 시작일 (YYYY-MM-DD)
  - `end_date` (String): 조회 종료일 (YYYY-MM-DD)
  - `college` (String): 단과대학 필터
  - `department` (String): 학과 필터
  - `journal_grade` (String): 저널등급 필터 (`'SCIE'`, `'KCI'`, `'일반'`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "journal_grade_distribution": [
        {
          "journal_grade": "SCIE",
          "count": 25
        },
        {
          "journal_grade": "KCI",
          "count": 40
        },
        {
          "journal_grade": "일반",
          "count": 15
        }
      ],
      "publication_by_department": [
        {
          "department": "컴퓨터공학과",
          "paper_count": 30
        },
        {
          "department": "전자공학과",
          "paper_count": 25
        }
      ],
      "publication_trend": [
        {
          "year": 2023,
          "month": 1,
          "count": 5
        },
        {
          "year": 2023,
          "month": 2,
          "count": 8
        }
      ]
    }
  }
  ```

### `GET /api/dashboard/students`
- **Description:** 학생 현황 대시보드 데이터를 조회합니다. 인증이 필요합니다.
- **Query Parameters (Optional):**
  - `college` (String): 단과대학 필터
  - `department` (String): 학과 필터
  - `program_type` (String): 과정구분 필터 (`'학사'`, `'석사'`, `'박사'`)
  - `academic_status` (String): 학적상태 필터 (`'재학'`, `'휴학'`, `'졸업'`, `'제적'`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "students_by_department": [
        {
          "department": "컴퓨터공학과",
          "college": "공과대학",
          "student_count": 350
        },
        {
          "department": "전자공학과",
          "college": "공과대학",
          "student_count": 280
        }
      ],
      "students_by_program": [
        {
          "program_type": "학사",
          "student_count": 1200
        },
        {
          "program_type": "석사",
          "student_count": 150
        },
        {
          "program_type": "박사",
          "student_count": 50
        }
      ],
      "academic_status_statistics": [
        {
          "academic_status": "재학",
          "student_count": 1250
        },
        {
          "academic_status": "휴학",
          "student_count": 100
        },
        {
          "academic_status": "졸업",
          "student_count": 50
        }
      ]
    }
  }
  ```

### `GET /api/dashboard/budget`
- **Description:** 예산 집행 대시보드 데이터를 조회합니다. 인증이 필요합니다.
- **Query Parameters (Optional):**
  - `start_date` (String): 조회 시작일 (YYYY-MM-DD)
  - `end_date` (String): 조회 종료일 (YYYY-MM-DD)
  - `department` (String): 학과 필터
  - `funding_agency` (String): 지원기관 필터
  - `status` (String): 상태 필터 (`'집행완료'`, `'처리중'`, `'반려'`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "research_budget_execution": [
        {
          "execution_date": "2024-01-15",
          "expense_amount": 120000000
        },
        {
          "execution_date": "2024-02-20",
          "expense_amount": 80000000
        }
      ],
      "funding_agency_distribution": [
        {
          "funding_agency": "한국연구재단",
          "total_budget": 1500000000,
          "executed_amount": 1200000000,
          "execution_rate": 80.0
        },
        {
          "funding_agency": "정보통신기획평가원",
          "total_budget": 800000000,
          "executed_amount": 530000000,
          "execution_rate": 66.25
        }
      ],
      "project_execution_rates": [
        {
          "project_number": "NRF-2023-015",
          "project_name": "차세대 AI 반도체 설계",
          "total_budget": 500000000,
          "executed_amount": 427500000,
          "execution_rate": 85.5
        }
      ]
    }
  }
  ```

### `GET /api/dashboard/:type/export`
- **Description:** 대시보드 데이터를 CSV 형식으로 내보냅니다. 인증이 필요합니다.
- **Path Parameters:**
  - `type`: 대시보드 유형 (`'performance'`, `'papers'`, `'students'`, `'budget'`)
- **Query Parameters:** 각 대시보드 유형에 맞는 필터 파라미터 (위의 각 대시보드 엔드포인트와 동일)
- **Response (200 OK):**
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="dashboard_data.csv"`
  - CSV 파일 본문

---

## 5. 공통 오류 코드 (Common Error Codes)

| 오류 코드 | HTTP 상태 코드 | 설명 |
|---|---|---|
| `UNAUTHORIZED` | 401 | 인증 토큰이 없거나 유효하지 않음 |
| `FORBIDDEN` | 403 | 권한이 없음 (예: 관리자 권한 필요) |
| `NOT_FOUND` | 404 | 리소스를 찾을 수 없음 |
| `VALIDATION_ERROR` | 400 | 요청 데이터 검증 실패 |
| `INVALID_FILE_FORMAT` | 400 | 잘못된 파일 형식 |
| `FILE_TOO_LARGE` | 400 | 파일 크기 초과 |
| `MISSING_REQUIRED_COLUMNS` | 400 | 필수 컬럼 누락 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

---

**문서 버전:** 1.0  
**작성일:** 2025-01-XX  
**작성자:** api-designer 에이전트  
**기반 문서:** `docs/prd.md`, `docs/userflow.md`, `docs/database.md`

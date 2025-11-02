# 데이터베이스 스키마 구현 검토 리포트

**검토일:** 2025-01-XX  
**검토 대상:** `docs/database.md` 스키마 정의 vs 실제 Django 모델 구현  
**검토자:** database-review-agent

---

## 1. 검토 개요

### 1.1 현재 상태
- ✅ **스키마 문서 (`docs/database.md`)**: 완전히 작성됨
  - 6개 테이블 정의 완료
  - ERD, 테이블 명세, 인덱스 전략 모두 명시
- ❌ **Django 모델 구현**: **미구현 상태**
  - 모든 모델 파일이 비어있거나 예시 코드만 존재
  - 마이그레이션 파일 생성되지 않음

### 1.2 검토 범위
1. 테이블 정의 완전성 (6개 테이블)
2. 필드 타입 및 제약조건 적절성
3. 인덱스 구현 필요성
4. 관계(Foreign Key) 정의
5. 트리거 구현 필요성
6. RLS 비활성화 요구사항

---

## 2. 상세 검토 결과

### 2.1 테이블 정의 현황

| 테이블명 | 스키마 문서 상태 | Django 모델 상태 | 비고 |
|---------|----------------|-----------------|------|
| `users` | ✅ 정의됨 | ❌ 미구현 | Django 기본 User 모델 재정의 필요 |
| `department_kpi` | ✅ 정의됨 | ❌ 미구현 | - |
| `publication_list` | ✅ 정의됨 | ❌ 미구현 | - |
| `research_project_data` | ✅ 정의됨 | ❌ 미구현 | - |
| `student_roster` | ✅ 정의됨 | ❌ 미구현 | - |
| `upload_logs` | ✅ 정의됨 | ❌ 미구현 | - |

**결론:** **모든 테이블이 미구현 상태입니다.**

---

### 2.2 스키마 문서 품질 검토

#### ✅ 잘 정의된 부분

1. **데이터 타입 선택**
   - UUID, VARCHAR, DECIMAL, BIGINT 등 적절한 타입 선택
   - CSV 샘플 데이터(`docs/csv-sample.md`)와 일치

2. **제약조건 정의**
   - NOT NULL, UNIQUE, CHECK 제약조건 명확히 정의
   - 도메인 제약조건 (예: `evaluation_year >= 2023 AND evaluation_year <= 2025`)

3. **인덱스 전략**
   - Primary Key 인덱스
   - 조회 성능 최적화를 위한 인덱스 정의
   - 복합 인덱스 적절히 설계

4. **관계 정의**
   - Foreign Key 관계 명시 (`upload_logs.uploaded_by → users.id`)
   - 논리적 관계도 문서화

#### ⚠️ 주의 필요 사항

1. **Primary Key 설계 불일치**
   - 문서에는 다음 Primary Key가 명시되어 있음:
     - `department_kpi`: `(evaluation_year, department)` - **복합키**
     - `publication_list`: `publication_id` - 단일키
     - `research_project_data`: `execution_id` - 단일키
     - `student_roster`: `student_id` - 단일키
   - 하지만 모든 테이블에 `id UUID` Primary Key도 정의되어 있음
   - **해결 방안:** Django에서는 UUID Primary Key를 사용하고, 복합 Unique 제약조건을 추가

2. **Django User 모델 확장**
   - 문서에는 `users` 테이블이 별도로 정의되어 있음
   - Django는 기본 `User` 모델을 제공하지만, `is_admin` 필드가 없음
   - **해결 방안:** 
     - 옵션 A: Django 기본 User 모델 확장 (`AbstractUser` 상속)
     - 옵션 B: 별도 `UserProfile` 모델 생성
   - 권장: 옵션 A (Django 인증 시스템과의 통합 용이)

3. **트리거 구현**
   - 문서에는 `updated_at` 자동 업데이트 트리거가 명시됨
   - Django에서는 모델의 `save()` 메서드 오버라이드로 구현 가능
   - 또는 PostgreSQL 트리거를 마이그레이션에서 직접 생성

4. **CHECK 제약조건의 Django 표현**
   - PostgreSQL CHECK 제약조건을 Django 모델에서 구현:
     - `models.CheckConstraint` 사용
     - 또는 모델/시리얼라이저 레벨에서 검증

---

## 3. 발견된 문제점 및 개선 제안

### 3.1 심각도: 높음

#### 문제 1: 모델 미구현
- **현황:** 모든 모델 파일이 비어있음
- **영향:** 데이터베이스 스키마가 실제로 생성되지 않음
- **조치 필요:** 즉시 모델 구현 필요

#### 문제 2: Primary Key 설계 혼동
- **현황:** 문서에 UUID `id`와 비즈니스 키(예: `publication_id`) 모두 명시
- **영향:** 어떤 것을 Primary Key로 사용할지 불명확
- **조치 필요:** 
  - Django 권장사항: UUID `id`를 Primary Key로 사용
  - 비즈니스 키는 `unique=True` 제약조건으로 처리
  - 복합키는 `unique_together` 또는 `UniqueConstraint` 사용

#### 문제 3: Django User 모델 통합
- **현황:** `users` 테이블이 별도로 정의되어 있지만 Django는 기본 User 모델 사용
- **영향:** 인증 시스템과의 통합 문제 가능
- **조치 필요:** Django의 `AbstractUser`를 상속하여 `is_admin` 필드 추가

### 3.2 심각도: 중간

#### 문제 4: 트리거 구현 방법 미정
- **현황:** `updated_at` 자동 업데이트 방법 미결정
- **조치 필요:**
  - Django 방식: 모델 `save()` 오버라이드 (권장)
  - PostgreSQL 트리거: 마이그레이션에서 SQL 직접 실행

#### 문제 5: CHECK 제약조건 구현 방법
- **현황:** 복잡한 CHECK 제약조건의 Django 구현 방법 미정
- **조치 필요:** `models.CheckConstraint` 사용 또는 시리얼라이저 검증

### 3.3 심각도: 낮음

#### 문제 6: 인덱스 자동 생성 여부
- **현황:** 문서에 명시된 인덱스들이 Django에서 자동으로 생성되는지 확인 필요
- **조치 필요:** 
  - `db_index=True` 필드 옵션 사용
  - `Meta.indexes` 또는 `Meta.unique_together` 활용

---

## 4. 구현 우선순위

### Phase 1: 핵심 모델 구현 (필수)
1. ✅ `users` 모델 (Django User 확장)
2. ✅ `department_kpi` 모델
3. ✅ `publication_list` 모델
4. ✅ `research_project_data` 모델
5. ✅ `student_roster` 모델
6. ✅ `upload_logs` 모델

### Phase 2: 제약조건 및 관계 (필수)
1. ✅ Foreign Key 관계 정의 (`upload_logs.uploaded_by → users.id`)
2. ✅ Unique 제약조건 (비즈니스 키)
3. ✅ CHECK 제약조건 (도메인 검증)

### Phase 3: 인덱스 및 성능 최적화 (권장)
1. ✅ 조회 성능 인덱스 추가
2. ✅ 복합 인덱스 구현

### Phase 4: 트리거 및 자동화 (권장)
1. ✅ `updated_at` 자동 업데이트 트리거
2. ✅ 데이터 정합성 검증 로직

---

## 5. Django 모델 구현 가이드라인

### 5.1 필드 타입 매핑

| 문서 타입 | Django 필드 타입 | 비고 |
|----------|-----------------|------|
| `UUID` | `models.UUIDField(primary_key=True, default=uuid.uuid4)` | - |
| `VARCHAR(n)` | `models.CharField(max_length=n)` | - |
| `INTEGER` | `models.IntegerField()` | - |
| `DECIMAL(p,s)` | `models.DecimalField(max_digits=p, decimal_places=s)` | - |
| `BIGINT` | `models.BigIntegerField()` | - |
| `DATE` | `models.DateField()` | - |
| `TIMESTAMP` | `models.DateTimeField(auto_now_add=True)` 또는 `auto_now=True` | - |
| `BOOLEAN` | `models.BooleanField()` | - |
| `TEXT` | `models.TextField()` | - |

### 5.2 제약조건 구현

#### NOT NULL
```python
field = models.CharField(max_length=50)  # 기본적으로 NOT NULL
```

#### UNIQUE
```python
field = models.CharField(max_length=50, unique=True)
```

#### CHECK 제약조건
```python
class Meta:
    constraints = [
        models.CheckConstraint(
            check=models.Q(evaluation_year__gte=2023) & models.Q(evaluation_year__lte=2025),
            name='check_evaluation_year_range'
        ),
    ]
```

#### 복합 Unique
```python
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=['evaluation_year', 'department'],
            name='unique_year_department'
        ),
    ]
```

### 5.3 Foreign Key 관계

```python
uploaded_by = models.ForeignKey(
    User,
    on_delete=models.RESTRICT,
    related_name='upload_logs'
)
```

### 5.4 인덱스 구현

```python
class Meta:
    indexes = [
        models.Index(fields=['college', 'department']),
        models.Index(fields=['publication_date']),
    ]
```

---

## 6. 검토 결론

### 6.1 전반적 평가

**스키마 문서 품질:** ⭐⭐⭐⭐⭐ (5/5)
- 문서는 매우 상세하고 체계적으로 작성됨
- CSV 샘플 데이터와 완벽히 일치
- 인덱스, 제약조건, 관계 모두 명확히 정의

**구현 상태:** ⭐ (1/5)
- **모든 모델이 미구현 상태**
- 즉시 구현 작업 필요

### 6.2 권장 사항

1. **즉시 조치:** 모든 Django 모델 구현
2. **설계 조정:** Primary Key 전략 명확화 (UUID Primary Key + Unique 제약조건)
3. **Django 통합:** User 모델 확장 방식 결정 (`AbstractUser` 권장)
4. **검증 전략:** CHECK 제약조건을 모델 레벨과 시리얼라이저 레벨에서 모두 구현

### 6.3 다음 단계

1. ✅ Django 모델 구현 시작
2. ✅ 마이그레이션 파일 생성 (`python manage.py makemigrations`)
3. ✅ 마이그레이션 적용 (`python manage.py migrate`)
4. ✅ 모델 검증 및 테스트

---

**검토 완료일:** 2025-01-XX  
**다음 검토 예정:** 모델 구현 완료 후


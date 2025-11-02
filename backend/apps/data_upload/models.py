import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class BaseModel(models.Model):
    """
    모든 모델의 공통 기본 클래스
    - UUID Primary Key
    - created_at, updated_at 자동 관리
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """updated_at을 자동으로 업데이트"""
        super().save(*args, **kwargs)


class DepartmentKPI(BaseModel):
    """
    학과별 연도별 주요 성과 지표(KPI) 데이터
    docs/database.md 2.2 참고
    """
    evaluation_year = models.IntegerField(
        help_text="평가년도 (2023~2025)"
    )
    college = models.CharField(
        max_length=50,
        help_text="단과대학명"
    )
    department = models.CharField(
        max_length=50,
        help_text="학과명"
    )
    employment_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ],
        help_text="졸업생 취업률 (%) (0~100 범위)"
    )
    fulltime_faculty_count = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="전임교원 수 (명)"
    )
    visiting_faculty_count = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="초빙교원 수 (명)"
    )
    tech_transfer_revenue = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="연간 기술이전 수입액 (억원)"
    )
    intl_conference_count = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="국제학술대회 개최 횟수"
    )

    class Meta:
        db_table = 'department_kpi'
        constraints = [
            models.UniqueConstraint(
                fields=['evaluation_year', 'department'],
                name='unique_year_department'
            ),
            models.CheckConstraint(
                check=models.Q(evaluation_year__gte=2023) & models.Q(evaluation_year__lte=2025),
                name='check_evaluation_year_range'
            ),
            models.CheckConstraint(
                check=models.Q(employment_rate__gte=0) & models.Q(employment_rate__lte=100),
                name='check_employment_rate_range'
            ),
            models.CheckConstraint(
                check=models.Q(fulltime_faculty_count__gte=0),
                name='check_fulltime_faculty_count_positive'
            ),
            models.CheckConstraint(
                check=models.Q(visiting_faculty_count__gte=0),
                name='check_visiting_faculty_count_positive'
            ),
            models.CheckConstraint(
                check=models.Q(tech_transfer_revenue__gte=0),
                name='check_tech_transfer_revenue_positive'
            ),
            models.CheckConstraint(
                check=models.Q(intl_conference_count__gte=0),
                name='check_intl_conference_count_positive'
            ),
        ]
        indexes = [
            models.Index(fields=['evaluation_year', 'department'], name='idx_department_kpi_year_dept'),
            models.Index(fields=['college'], name='idx_department_kpi_college'),
            models.Index(fields=['department'], name='idx_department_kpi_department'),
            models.Index(fields=['evaluation_year', 'employment_rate'], name='idx_department_kpi_year_employment'),
        ]

    def __str__(self):
        return f"{self.evaluation_year}년 {self.college} {self.department}"


class PublicationList(BaseModel):
    """
    학과별 논문 게재 현황 데이터
    docs/database.md 2.3 참고
    """
    publication_id = models.CharField(
        max_length=20,
        unique=True,
        help_text="논문ID (고유 식별자, 예: PUB-23-001)"
    )
    publication_date = models.DateField(
        help_text="게재일"
    )
    college = models.CharField(
        max_length=50,
        help_text="단과대학명"
    )
    department = models.CharField(
        max_length=50,
        help_text="학과명"
    )
    title = models.CharField(
        max_length=500,
        help_text="논문제목"
    )
    first_author = models.CharField(
        max_length=100,
        help_text="주저자명"
    )
    co_authors = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="참여저자 (세미콜론(;)으로 구분)"
    )
    journal_name = models.CharField(
        max_length=200,
        help_text="학술지명"
    )
    journal_grade = models.CharField(
        max_length=20,
        choices=[
            ('SCIE', 'SCIE'),
            ('KCI', 'KCI'),
            ('일반', '일반'),
        ],
        help_text="저널등급"
    )
    impact_factor = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Impact Factor (SCIE 논문만 해당)"
    )
    project_linked = models.CharField(
        max_length=1,
        choices=[
            ('Y', 'Y'),
            ('N', 'N'),
        ],
        help_text="과제연계여부"
    )

    class Meta:
        db_table = 'publication_list'
        constraints = [
            models.CheckConstraint(
                check=models.Q(journal_grade__in=['SCIE', 'KCI', '일반']),
                name='check_journal_grade_valid'
            ),
            models.CheckConstraint(
                check=models.Q(project_linked__in=['Y', 'N']),
                name='check_project_linked_valid'
            ),
        ]
        indexes = [
            models.Index(fields=['publication_id'], name='idx_publication_list_pub_id'),
            models.Index(fields=['publication_date'], name='idx_publication_list_date'),
            models.Index(fields=['college', 'department'], name='idx_publication_list_college_dept'),
            models.Index(fields=['journal_grade'], name='idx_publication_list_journal_grade'),
            models.Index(fields=['publication_date', 'journal_grade'], name='idx_publication_list_date_grade'),
        ]

    def __str__(self):
        return f"{self.publication_id}: {self.title}"


class ResearchProjectData(BaseModel):
    """
    연구과제별 예산 집행 내역 데이터
    docs/database.md 2.4 참고
    """
    execution_id = models.CharField(
        max_length=20,
        unique=True,
        help_text="집행ID (고유 식별자, 예: T2301001)"
    )
    project_number = models.CharField(
        max_length=50,
        help_text="과제번호"
    )
    project_name = models.CharField(
        max_length=200,
        help_text="과제명"
    )
    principal_investigator = models.CharField(
        max_length=100,
        help_text="연구책임자 (교수명)"
    )
    department = models.CharField(
        max_length=50,
        help_text="소속학과"
    )
    funding_agency = models.CharField(
        max_length=100,
        help_text="지원기관"
    )
    total_budget = models.BigIntegerField(
        validators=[MinValueValidator(0)],
        help_text="총연구비 (원)"
    )
    execution_date = models.DateField(
        help_text="집행일자"
    )
    expense_item = models.CharField(
        max_length=100,
        help_text="집행항목"
    )
    expense_amount = models.BigIntegerField(
        validators=[MinValueValidator(0)],
        help_text="집행금액 (원)"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('집행완료', '집행완료'),
            ('처리중', '처리중'),
            ('반려', '반려'),
        ],
        help_text="상태"
    )
    notes = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="비고"
    )

    class Meta:
        db_table = 'research_project_data'
        constraints = [
            models.CheckConstraint(
                check=models.Q(total_budget__gte=0),
                name='check_total_budget_positive'
            ),
            models.CheckConstraint(
                check=models.Q(expense_amount__gte=0),
                name='check_expense_amount_positive'
            ),
            models.CheckConstraint(
                check=models.Q(status__in=['집행완료', '처리중', '반려']),
                name='check_status_valid'
            ),
        ]
        indexes = [
            models.Index(fields=['execution_id'], name='idx_research_project_exec_id'),
            models.Index(fields=['project_number'], name='idx_research_project_number'),
            models.Index(fields=['department'], name='idx_research_project_dept'),
            models.Index(fields=['execution_date'], name='idx_research_project_date'),
            models.Index(fields=['status'], name='idx_research_project_status'),
            models.Index(fields=['funding_agency'], name='idx_research_project_funding_agency'),
            models.Index(fields=['funding_agency', 'execution_date'], name='idx_research_project_agency_date'),
        ]

    def __str__(self):
        return f"{self.execution_id}: {self.project_name}"


class StudentRoster(BaseModel):
    """
    학부생 및 대학원생의 기본 정보
    docs/database.md 2.5 참고
    """
    student_id = models.CharField(
        max_length=10,
        unique=True,
        help_text="학번 (고유 식별자)"
    )
    name = models.CharField(
        max_length=50,
        help_text="이름"
    )
    college = models.CharField(
        max_length=50,
        help_text="단과대학명"
    )
    department = models.CharField(
        max_length=50,
        help_text="학과명"
    )
    grade = models.IntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(4)
        ],
        help_text="학년 (0~4, 0은 대학원생)"
    )
    program_type = models.CharField(
        max_length=10,
        choices=[
            ('학사', '학사'),
            ('석사', '석사'),
            ('박사', '박사'),
        ],
        help_text="과정구분"
    )
    academic_status = models.CharField(
        max_length=20,
        choices=[
            ('재학', '재학'),
            ('휴학', '휴학'),
            ('졸업', '졸업'),
            ('제적', '제적'),
        ],
        help_text="학적상태"
    )
    gender = models.CharField(
        max_length=1,
        choices=[
            ('남', '남'),
            ('여', '여'),
        ],
        help_text="성별"
    )
    admission_year = models.IntegerField(
        validators=[
            MinValueValidator(2000),
            MaxValueValidator(2100)
        ],
        help_text="입학년도 (YYYY)"
    )
    advisor = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="지도교수 (대학원생의 경우 필수)"
    )
    email = models.CharField(
        max_length=100,
        help_text="이메일 주소"
    )

    class Meta:
        db_table = 'student_roster'
        constraints = [
            models.CheckConstraint(
                check=models.Q(grade__gte=0) & models.Q(grade__lte=4),
                name='check_grade_range'
            ),
            models.CheckConstraint(
                check=models.Q(program_type__in=['학사', '석사', '박사']),
                name='check_program_type_valid'
            ),
            models.CheckConstraint(
                check=models.Q(academic_status__in=['재학', '휴학', '졸업', '제적']),
                name='check_academic_status_valid'
            ),
            models.CheckConstraint(
                check=models.Q(gender__in=['남', '여']),
                name='check_gender_valid'
            ),
            models.CheckConstraint(
                check=models.Q(admission_year__gte=2000) & models.Q(admission_year__lte=2100),
                name='check_admission_year_range'
            ),
        ]
        indexes = [
            models.Index(fields=['student_id'], name='idx_student_roster_student_id'),
            models.Index(fields=['college', 'department'], name='idx_student_roster_college_dept'),
            models.Index(fields=['program_type'], name='idx_student_roster_program_type'),
            models.Index(fields=['academic_status'], name='idx_student_roster_academic_status'),
            models.Index(fields=['email'], name='idx_student_roster_email'),
        ]

    def __str__(self):
        return f"{self.student_id}: {self.name} ({self.department})"


class UploadLog(BaseModel):
    """
    CSV 파일 업로드 이력
    docs/database.md 2.6 참고
    """
    file_name = models.CharField(
        max_length=255,
        help_text="업로드된 파일명"
    )
    data_type = models.CharField(
        max_length=20,
        choices=[
            ('kpi', 'kpi'),
            ('publication', 'publication'),
            ('project', 'project'),
            ('student', 'student'),
        ],
        help_text="데이터 유형"
    )
    total_rows = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="파일 내 전체 행 수"
    )
    success_rows = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="성공적으로 처리된 행 수"
    )
    failed_rows = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="처리 실패한 행 수"
    )
    error_details = models.TextField(
        blank=True,
        null=True,
        help_text="오류 상세 정보 (JSON 형식)"
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.RESTRICT,
        related_name='upload_logs',
        help_text="업로드한 사용자"
    )

    class Meta:
        db_table = 'upload_logs'
        constraints = [
            models.CheckConstraint(
                check=models.Q(data_type__in=['kpi', 'publication', 'project', 'student']),
                name='check_data_type_valid'
            ),
            models.CheckConstraint(
                check=models.Q(total_rows__gte=0),
                name='check_total_rows_positive'
            ),
            models.CheckConstraint(
                check=models.Q(success_rows__gte=0),
                name='check_success_rows_positive'
            ),
            models.CheckConstraint(
                check=models.Q(failed_rows__gte=0),
                name='check_failed_rows_positive'
            ),
        ]
        indexes = [
            models.Index(fields=['uploaded_by'], name='idx_upload_logs_uploaded_by'),
            models.Index(fields=['data_type'], name='idx_upload_logs_data_type'),
            models.Index(fields=['created_at'], name='idx_upload_logs_created_at'),
        ]

    def __str__(self):
        return f"{self.file_name} ({self.data_type}) - {self.uploaded_by.username}"

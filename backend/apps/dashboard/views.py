from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Sum, Q
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from config.responses import success_response
from apps.data_upload.models import (
    DepartmentKPI,
    PublicationList,
    ResearchProjectData,
    StudentRoster,
)
from django.db.models.functions import ExtractYear, ExtractMonth


class OverviewView(APIView):
    """
    메인 대시보드의 4개 주요 지표 요약 데이터를 조회합니다.
    GET /api/dashboard/overview/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        데이터베이스에서 실제 데이터를 집계하여 반환합니다.
        최적화: 여러 쿼리를 배치로 실행하여 DB 왕복 횟수 감소
        """
        current_year = timezone.now().year
        one_year_ago = timezone.now() - timedelta(days=365)
        
        # 실적: 최신 연도 평균 취업률 (최적화: 한 번의 쿼리로 처리)
        latest_year = DepartmentKPI.objects.aggregate(
            latest_year=models.Max('evaluation_year')
        )['latest_year']
        
        performance_value = 0.0
        if latest_year:
            performance_avg = DepartmentKPI.objects.filter(
                evaluation_year=latest_year
            ).aggregate(avg=Avg('employment_rate'))
            performance_value = float(performance_avg['avg'] or 0)
        
        # 논문: 최근 1년 논문 수 (인덱스 활용)
        papers_count = PublicationList.objects.filter(
            publication_date__gte=one_year_ago
        ).count()
        
        # 학생: 현재 재학생 수 (인덱스 활용)
        students_count = StudentRoster.objects.filter(
            academic_status='재학'
        ).count()
        
        # 예산: 집행률 계산 (최적화: 한 번의 쿼리로 두 집계 수행)
        budget_aggregates = ResearchProjectData.objects.aggregate(
            total_budget=Sum('total_budget'),
            total_expense=Sum('expense_amount')
        )
        total_budget = budget_aggregates['total_budget'] or 0
        total_expense = budget_aggregates['total_expense'] or 0
        budget_value = (total_expense / total_budget * 100) if total_budget > 0 else 0.0
        
        response_data = {
            "performance": {
                "label": "실적",
                "value": round(performance_value, 1),
                "unit": "%",
                "trend": "up",
            },
            "papers": {
                "label": "논문",
                "value": papers_count,
                "unit": "건",
                "trend": "up",
            },
            "students": {
                "label": "학생",
                "value": students_count,
                "unit": "명",
                "trend": "stable",
            },
            "budget": {
                "label": "예산",
                "value": round(budget_value, 1),
                "unit": "%",
                "trend": "up",
            },
        }

        return success_response(response_data)


class PerformanceView(APIView):
    """
    실적 대시보드 데이터를 조회합니다.
    GET /api/dashboard/performance/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        데이터베이스에서 실적 데이터를 집계하여 반환합니다.

        Query Parameters:
        - evaluation_year (optional): 평가년도 필터
        - college (optional): 단과대학 필터
        - department (optional): 학과 필터
        """
        evaluation_year = request.query_params.get("evaluation_year")
        college = request.query_params.get("college")
        department = request.query_params.get("department")

        # 필터 적용
        filters = Q()
        if evaluation_year:
            try:
                filters &= Q(evaluation_year=int(evaluation_year))
            except ValueError:
                pass
        if college:
            filters &= Q(college=college)
        if department:
            filters &= Q(department=department)

        queryset = DepartmentKPI.objects.filter(filters)

        # 최적화: 한 번의 쿼리로 모든 필요한 필드를 가져와서 Python에서 처리
        # 이렇게 하면 N개의 쿼리 대신 1개의 쿼리만 실행
        kpi_data = list(queryset.values(
            'department', 'college', 'employment_rate', 'evaluation_year',
            'tech_transfer_revenue', 'fulltime_faculty_count', 
            'visiting_faculty_count', 'intl_conference_count'
        ))

        # Python에서 데이터 분류 및 변환
        employment_rates = []
        tech_transfer_revenue = []
        faculty_status_dict = {}
        intl_conference_count = []

        seen_employment = set()
        seen_tech_transfer = set()
        seen_faculty = set()
        seen_conference = set()

        for kpi in kpi_data:
            # 학과별 취업률
            emp_key = (kpi['department'], kpi['college'], kpi['evaluation_year'])
            if emp_key not in seen_employment:
                employment_rates.append({
                    "department": kpi['department'],
                    "college": kpi['college'],
                    "employment_rate": float(kpi['employment_rate']),
                    "evaluation_year": kpi['evaluation_year'],
                })
                seen_employment.add(emp_key)

            # 기술이전 수입 추이
            tech_key = (kpi['evaluation_year'], kpi['department'])
            if tech_key not in seen_tech_transfer:
                tech_transfer_revenue.append({
                    "evaluation_year": kpi['evaluation_year'],
                    "department": kpi['department'],
                    "revenue": float(kpi['tech_transfer_revenue']),
                })
                seen_tech_transfer.add(tech_key)

            # 교원 현황
            faculty_key = kpi['department']
            if faculty_key not in seen_faculty:
                faculty_status_dict[faculty_key] = {
                    "department": kpi['department'],
                    "fulltime_count": kpi['fulltime_faculty_count'],
                    "visiting_count": kpi['visiting_faculty_count'],
                }
                seen_faculty.add(faculty_key)

            # 국제학술대회 개최 횟수
            conf_key = (kpi['evaluation_year'], kpi['department'])
            if conf_key not in seen_conference:
                intl_conference_count.append({
                    "evaluation_year": kpi['evaluation_year'],
                    "department": kpi['department'],
                    "count": kpi['intl_conference_count'],
                })
                seen_conference.add(conf_key)

        faculty_status = list(faculty_status_dict.values())

        response_data = {
            "employment_rates": employment_rates,
            "tech_transfer_revenue": tech_transfer_revenue,
            "faculty_status": faculty_status,
            "intl_conference_count": intl_conference_count,
        }

        return success_response(response_data)


class PapersView(APIView):
    """
    논문 게재 현황 대시보드 데이터를 조회합니다.
    GET /api/dashboard/papers/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        데이터베이스에서 논문 데이터를 집계하여 반환합니다.

        Query Parameters:
        - start_date (optional): 조회 시작일 (YYYY-MM-DD)
        - end_date (optional): 조회 종료일 (YYYY-MM-DD)
        - college (optional): 단과대학 필터
        - department (optional): 학과 필터
        - journal_grade (optional): 저널등급 필터 (SCIE, KCI, 일반)
        """
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        college = request.query_params.get("college")
        department = request.query_params.get("department")
        journal_grade = request.query_params.get("journal_grade")

        # 필터 적용
        filters = Q()
        if start_date:
            try:
                filters &= Q(publication_date__gte=datetime.strptime(start_date, "%Y-%m-%d").date())
            except ValueError:
                pass
        if end_date:
            try:
                filters &= Q(publication_date__lte=datetime.strptime(end_date, "%Y-%m-%d").date())
            except ValueError:
                pass
        if college:
            filters &= Q(college=college)
        if department:
            filters &= Q(department=department)
        if journal_grade:
            filters &= Q(journal_grade=journal_grade)

        queryset = PublicationList.objects.filter(filters)

        # 저널 등급별 분포
        journal_grade_distribution = []
        for grade_data in queryset.values('journal_grade').annotate(
            count=Count('id')
        ):
            journal_grade_distribution.append({
                "journal_grade": grade_data['journal_grade'],
                "count": grade_data['count'],
            })

        # 학과별 논문 게재 수
        publication_by_department = []
        for dept_data in queryset.values('department').annotate(
            paper_count=Count('id')
        ):
            publication_by_department.append({
                "department": dept_data['department'],
                "paper_count": dept_data['paper_count'],
            })

        # 논문 게재 추이 (월별) - 최적화: Django ORM 함수 사용
        publication_trend = []
        for trend_data in queryset.annotate(
            year=ExtractYear('publication_date'),
            month=ExtractMonth('publication_date')
        ).values('year', 'month').annotate(
            count=Count('id')
        ).order_by('year', 'month'):
            publication_trend.append({
                "year": trend_data['year'],
                "month": trend_data['month'],
                "count": trend_data['count'],
            })

        response_data = {
            "journal_grade_distribution": journal_grade_distribution,
            "publication_by_department": publication_by_department,
            "publication_trend": publication_trend,
        }

        return success_response(response_data)


class StudentsView(APIView):
    """
    학생 현황 대시보드 데이터를 조회합니다.
    GET /api/dashboard/students/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        데이터베이스에서 학생 데이터를 집계하여 반환합니다.

        Query Parameters:
        - college (optional): 단과대학 필터
        - department (optional): 학과 필터
        - program_type (optional): 과정구분 필터 (학사, 석사, 박사)
        - academic_status (optional): 학적상태 필터 (재학, 휴학, 졸업, 제적)
        """
        college = request.query_params.get("college")
        department = request.query_params.get("department")
        program_type = request.query_params.get("program_type")
        academic_status = request.query_params.get("academic_status")

        # 필터 적용
        filters = Q()
        if college:
            filters &= Q(college=college)
        if department:
            filters &= Q(department=department)
        if program_type:
            filters &= Q(program_type=program_type)
        if academic_status:
            filters &= Q(academic_status=academic_status)

        queryset = StudentRoster.objects.filter(filters)

        # 학과별 학생 수
        students_by_department = []
        for dept_data in queryset.values('department', 'college').annotate(
            student_count=Count('id')
        ):
            students_by_department.append({
                "department": dept_data['department'],
                "college": dept_data['college'],
                "student_count": dept_data['student_count'],
            })

        # 과정별 학생 분포
        students_by_program = []
        for program_data in queryset.values('program_type').annotate(
            student_count=Count('id')
        ):
            students_by_program.append({
                "program_type": program_data['program_type'],
                "student_count": program_data['student_count'],
            })

        # 학적상태별 통계
        academic_status_statistics = []
        for status_data in queryset.values('academic_status').annotate(
            student_count=Count('id')
        ):
            academic_status_statistics.append({
                "academic_status": status_data['academic_status'],
                "student_count": status_data['student_count'],
            })

        response_data = {
            "students_by_department": students_by_department,
            "students_by_program": students_by_program,
            "academic_status_statistics": academic_status_statistics,
        }

        return success_response(response_data)


class BudgetView(APIView):
    """
    예산 집행 대시보드 데이터를 조회합니다.
    GET /api/dashboard/budget/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        데이터베이스에서 예산 데이터를 집계하여 반환합니다.

        Query Parameters:
        - start_date (optional): 조회 시작일 (YYYY-MM-DD)
        - end_date (optional): 조회 종료일 (YYYY-MM-DD)
        - department (optional): 학과 필터
        - funding_agency (optional): 지원기관 필터
        - status (optional): 상태 필터 (집행완료, 처리중, 반려)
        """
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        department = request.query_params.get("department")
        funding_agency = request.query_params.get("funding_agency")
        status_filter = request.query_params.get("status")

        # 필터 적용
        filters = Q()
        if start_date:
            try:
                filters &= Q(execution_date__gte=datetime.strptime(start_date, "%Y-%m-%d").date())
            except ValueError:
                pass
        if end_date:
            try:
                filters &= Q(execution_date__lte=datetime.strptime(end_date, "%Y-%m-%d").date())
            except ValueError:
                pass
        if department:
            filters &= Q(department=department)
        if funding_agency:
            filters &= Q(funding_agency=funding_agency)
        if status_filter:
            filters &= Q(status=status_filter)

        queryset = ResearchProjectData.objects.filter(filters)

        # 연구비 집행 현황 (일별 집행 금액)
        research_budget_execution = []
        for exec_data in queryset.values('execution_date').annotate(
            expense_amount=Sum('expense_amount')
        ).order_by('execution_date'):
            research_budget_execution.append({
                "execution_date": exec_data['execution_date'].strftime("%Y-%m-%d"),
                "expense_amount": exec_data['expense_amount'],
            })

        # 지원기관별 분포 - 최적화: DB 레벨에서 집계 (Python 루프 제거)
        funding_agency_distribution = []
        for agency_data in queryset.values('funding_agency').annotate(
            total_budget=Sum('total_budget'),
            executed_amount=Sum('expense_amount')
        ):
            total_budget = agency_data['total_budget'] or 0
            executed_amount = agency_data['executed_amount'] or 0
            execution_rate = (executed_amount / total_budget * 100) if total_budget > 0 else 0.0
            
            funding_agency_distribution.append({
                "funding_agency": agency_data['funding_agency'],
                "total_budget": total_budget,
                "executed_amount": executed_amount,
                "execution_rate": round(execution_rate, 2),
            })

        # 과제별 집행률
        project_execution_rates = []
        for project_data in queryset.values('project_number', 'project_name').annotate(
            total_budget=Sum('total_budget'),
            executed_amount=Sum('expense_amount')
        ).distinct():
            total_budget = project_data['total_budget'] or 0
            executed_amount = project_data['executed_amount'] or 0
            execution_rate = (executed_amount / total_budget * 100) if total_budget > 0 else 0.0
            
            project_execution_rates.append({
                "project_number": project_data['project_number'],
                "project_name": project_data['project_name'],
                "total_budget": total_budget,
                "executed_amount": executed_amount,
                "execution_rate": round(execution_rate, 2),
            })

        response_data = {
            "research_budget_execution": research_budget_execution,
            "funding_agency_distribution": funding_agency_distribution,
            "project_execution_rates": project_execution_rates,
        }

        return success_response(response_data)

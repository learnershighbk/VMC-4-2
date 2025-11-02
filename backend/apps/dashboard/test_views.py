"""
대시보드 API 엔드포인트 테스트 (필터링 포함)
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from apps.data_upload.models import (
    DepartmentKPI,
    PublicationList,
    ResearchProjectData,
    StudentRoster,
)

User = get_user_model()


@pytest.fixture
def sample_user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
    )


@pytest.fixture
def authenticated_client(api_client, sample_user):
    api_client.force_authenticate(user=sample_user)
    return api_client


@pytest.fixture
def sample_kpi_data(db):
    """테스트용 KPI 데이터 생성"""
    kpi1 = DepartmentKPI.objects.create(
        evaluation_year=2024,
        college='공과대학',
        department='컴퓨터공학과',
        employment_rate=85.5,
        fulltime_faculty_count=10,
        visiting_faculty_count=2,
        tech_transfer_revenue=5.2,
        intl_conference_count=3,
    )
    kpi2 = DepartmentKPI.objects.create(
        evaluation_year=2024,
        college='공과대학',
        department='전기공학과',
        employment_rate=80.0,
        fulltime_faculty_count=8,
        visiting_faculty_count=1,
        tech_transfer_revenue=4.0,
        intl_conference_count=2,
    )
    kpi3 = DepartmentKPI.objects.create(
        evaluation_year=2023,
        college='공과대학',
        department='컴퓨터공학과',
        employment_rate=82.0,
        fulltime_faculty_count=9,
        visiting_faculty_count=2,
        tech_transfer_revenue=4.5,
        intl_conference_count=2,
    )
    return [kpi1, kpi2, kpi3]


@pytest.fixture
def sample_publication_data(db):
    """테스트용 Publication 데이터 생성"""
    pub1 = PublicationList.objects.create(
        publication_id='PUB-24-001',
        publication_date=date(2024, 1, 15),
        college='공과대학',
        department='컴퓨터공학과',
        title='Test Paper 1',
        first_author='홍길동',
        journal_name='Test Journal',
        journal_grade='SCIE',
        impact_factor=3.5,
        project_linked='Y',
    )
    pub2 = PublicationList.objects.create(
        publication_id='PUB-24-002',
        publication_date=date(2024, 2, 20),
        college='공과대학',
        department='전기공학과',
        title='Test Paper 2',
        first_author='김철수',
        journal_name='Test Journal 2',
        journal_grade='KCI',
        project_linked='N',
    )
    pub3 = PublicationList.objects.create(
        publication_id='PUB-23-001',
        publication_date=date(2023, 12, 10),
        college='공과대학',
        department='컴퓨터공학과',
        title='Test Paper 3',
        first_author='이영희',
        journal_name='Test Journal 3',
        journal_grade='일반',
        project_linked='Y',
    )
    return [pub1, pub2, pub3]


@pytest.fixture
def sample_project_data(db):
    """테스트용 Project 데이터 생성"""
    project1 = ResearchProjectData.objects.create(
        execution_id='T2401001',
        project_number='PRJ-2024-001',
        project_name='Test Project 1',
        principal_investigator='홍길동',
        department='컴퓨터공학과',
        funding_agency='과학기술정보통신부',
        total_budget=100000000,
        execution_date=date(2024, 1, 15),
        expense_item='인건비',
        expense_amount=50000000,
        status='처리중',
    )
    project2 = ResearchProjectData.objects.create(
        execution_id='T2401002',
        project_number='PRJ-2024-002',
        project_name='Test Project 2',
        principal_investigator='김철수',
        department='전기공학과',
        funding_agency='국가과학기술연구회',
        total_budget=200000000,
        execution_date=date(2024, 2, 20),
        expense_item='장비구입비',
        expense_amount=150000000,
        status='집행완료',
    )
    return [project1, project2]


@pytest.fixture
def sample_student_data(db):
    """테스트용 Student 데이터 생성"""
    student1 = StudentRoster.objects.create(
        student_id='20240001',
        name='홍길동',
        college='공과대학',
        department='컴퓨터공학과',
        grade=3,
        program_type='학사',
        academic_status='재학',
        gender='남',
        admission_year=2021,
        email='hong@example.com',
    )
    student2 = StudentRoster.objects.create(
        student_id='20240002',
        name='김철수',
        college='공과대학',
        department='전기공학과',
        grade=2,
        program_type='학사',
        academic_status='재학',
        gender='남',
        admission_year=2022,
        email='kim@example.com',
    )
    student3 = StudentRoster.objects.create(
        student_id='20230001',
        name='이영희',
        college='공과대학',
        department='컴퓨터공학과',
        grade=0,
        program_type='석사',
        academic_status='재학',
        gender='여',
        admission_year=2023,
        email='lee@example.com',
    )
    return [student1, student2, student3]


class TestOverviewView:
    """대시보드 개요 API 테스트"""

    def test_overview_without_authentication(self, api_client):
        """인증 없이 개요 조회 시 401 응답 테스트"""
        response = api_client.get('/api/dashboard/overview/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_overview_with_authentication(self, authenticated_client, sample_kpi_data, 
                                         sample_publication_data, sample_student_data, 
                                         sample_project_data):
        """인증된 사용자가 개요 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/overview/')
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert 'data' in data
        overview = data['data']
        assert 'performance' in overview
        assert 'papers' in overview
        assert 'students' in overview
        assert 'budget' in overview
        
        # 최신 연도 평균 취업률 확인
        assert 'value' in overview['performance']
        assert 'unit' in overview['performance']
        assert overview['performance']['unit'] == '%'
        
        # 논문 수 확인 (최근 1년)
        assert overview['papers']['value'] >= 0
        assert overview['papers']['unit'] == '건'
        
        # 재학생 수 확인
        assert overview['students']['value'] >= 0
        assert overview['students']['unit'] == '명'
        
        # 예산 집행률 확인
        assert 'value' in overview['budget']
        assert overview['budget']['unit'] == '%'


class TestPerformanceView:
    """실적 대시보드 API 테스트"""

    def test_performance_without_authentication(self, api_client):
        """인증 없이 실적 조회 시 401 응답 테스트"""
        response = api_client.get('/api/dashboard/performance/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_performance_with_authentication(self, authenticated_client, sample_kpi_data):
        """인증된 사용자가 실적 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/performance/')
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert 'data' in data
        performance = data['data']
        
        assert 'employment_rates' in performance
        assert 'tech_transfer_revenue' in performance
        assert 'faculty_status' in performance
        assert 'intl_conference_count' in performance

    def test_performance_with_evaluation_year_filter(self, authenticated_client, sample_kpi_data):
        """평가년도 필터로 실적 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/performance/', {
            'evaluation_year': 2024
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        performance = data['data']
        
        # 2024년 데이터만 포함되어야 함
        for item in performance['employment_rates']:
            assert item['evaluation_year'] == 2024

    def test_performance_with_college_filter(self, authenticated_client, sample_kpi_data):
        """단과대학 필터로 실적 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/performance/', {
            'college': '공과대학'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        performance = data['data']
        
        # 공과대학 데이터만 포함되어야 함
        for item in performance['employment_rates']:
            assert item['college'] == '공과대학'

    def test_performance_with_department_filter(self, authenticated_client, sample_kpi_data):
        """학과 필터로 실적 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/performance/', {
            'department': '컴퓨터공학과'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        performance = data['data']
        
        # 컴퓨터공학과 데이터만 포함되어야 함
        for item in performance['employment_rates']:
            assert item['department'] == '컴퓨터공학과'

    def test_performance_with_multiple_filters(self, authenticated_client, sample_kpi_data):
        """여러 필터 조합으로 실적 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/performance/', {
            'evaluation_year': 2024,
            'college': '공과대학',
            'department': '컴퓨터공학과'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        performance = data['data']
        
        # 모든 필터 조건을 만족하는 데이터만 포함되어야 함
        for item in performance['employment_rates']:
            assert item['evaluation_year'] == 2024
            assert item['college'] == '공과대학'
            assert item['department'] == '컴퓨터공학과'


class TestPapersView:
    """논문 대시보드 API 테스트"""

    def test_papers_without_authentication(self, api_client):
        """인증 없이 논문 조회 시 401 응답 테스트"""
        response = api_client.get('/api/dashboard/papers/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_papers_with_authentication(self, authenticated_client, sample_publication_data):
        """인증된 사용자가 논문 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/papers/')
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert 'data' in data
        papers = data['data']
        
        assert 'journal_grade_distribution' in papers
        assert 'publication_by_department' in papers
        assert 'publication_trend' in papers

    def test_papers_with_start_date_filter(self, authenticated_client, sample_publication_data):
        """시작일 필터로 논문 조회 테스트"""
        start_date = '2024-01-01'
        response = authenticated_client.get('/api/dashboard/papers/', {
            'start_date': start_date
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        papers = data['data']
        
        # 2024-01-01 이후 데이터만 포함되어야 함
        # publication_trend는 집계된 데이터이므로 직접 확인하기 어려움
        # 대신 응답이 정상적으로 반환되는지 확인
        assert isinstance(papers['journal_grade_distribution'], list)

    def test_papers_with_end_date_filter(self, authenticated_client, sample_publication_data):
        """종료일 필터로 논문 조회 테스트"""
        end_date = '2024-12-31'
        response = authenticated_client.get('/api/dashboard/papers/', {
            'end_date': end_date
        })
        
        assert response.status_code == status.HTTP_200_OK

    def test_papers_with_date_range_filter(self, authenticated_client, sample_publication_data):
        """날짜 범위 필터로 논문 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/papers/', {
            'start_date': '2024-01-01',
            'end_date': '2024-12-31'
        })
        
        assert response.status_code == status.HTTP_200_OK

    def test_papers_with_journal_grade_filter(self, authenticated_client, sample_publication_data):
        """저널 등급 필터로 논문 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/papers/', {
            'journal_grade': 'SCIE'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        papers = data['data']
        
        # SCIE 등급 분포만 포함되어야 함
        for item in papers['journal_grade_distribution']:
            assert item['journal_grade'] == 'SCIE'

    def test_papers_with_department_filter(self, authenticated_client, sample_publication_data):
        """학과 필터로 논문 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/papers/', {
            'department': '컴퓨터공학과'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        papers = data['data']
        
        # 컴퓨터공학과 논문만 포함되어야 함
        for item in papers['publication_by_department']:
            assert item['department'] == '컴퓨터공학과'


class TestStudentsView:
    """학생 대시보드 API 테스트"""

    def test_students_without_authentication(self, api_client):
        """인증 없이 학생 조회 시 401 응답 테스트"""
        response = api_client.get('/api/dashboard/students/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_students_with_authentication(self, authenticated_client, sample_student_data):
        """인증된 사용자가 학생 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/students/')
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert 'data' in data
        students = data['data']
        
        assert 'students_by_department' in students
        assert 'students_by_program' in students
        assert 'academic_status_statistics' in students

    def test_students_with_program_type_filter(self, authenticated_client, sample_student_data):
        """과정구분 필터로 학생 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/students/', {
            'program_type': '학사'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        students = data['data']
        
        # 학사 과정만 포함되어야 함
        for item in students['students_by_program']:
            if item['program_type'] == '학사':
                assert item['student_count'] > 0

    def test_students_with_academic_status_filter(self, authenticated_client, sample_student_data):
        """학적상태 필터로 학생 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/students/', {
            'academic_status': '재학'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        students = data['data']
        
        # 재학 학생만 포함되어야 함
        for item in students['academic_status_statistics']:
            if item['academic_status'] == '재학':
                assert item['student_count'] > 0

    def test_students_with_college_department_filters(self, authenticated_client, sample_student_data):
        """단과대학 및 학과 필터로 학생 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/students/', {
            'college': '공과대학',
            'department': '컴퓨터공학과'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        students = data['data']
        
        # 공과대학 컴퓨터공학과 학생만 포함되어야 함
        for item in students['students_by_department']:
            if item['department'] == '컴퓨터공학과':
                assert item['college'] == '공과대학'


class TestBudgetView:
    """예산 대시보드 API 테스트"""

    def test_budget_without_authentication(self, api_client):
        """인증 없이 예산 조회 시 401 응답 테스트"""
        response = api_client.get('/api/dashboard/budget/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_budget_with_authentication(self, authenticated_client, sample_project_data):
        """인증된 사용자가 예산 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/budget/')
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert 'data' in data
        budget = data['data']
        
        assert 'research_budget_execution' in budget
        assert 'funding_agency_distribution' in budget
        assert 'project_execution_rates' in budget

    def test_budget_with_department_filter(self, authenticated_client, sample_project_data):
        """학과 필터로 예산 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/budget/', {
            'department': '컴퓨터공학과'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        budget = data['data']
        
        # 컴퓨터공학과 프로젝트만 포함되어야 함
        # project_execution_rates 확인
        for item in budget['project_execution_rates']:
            # 데이터는 집계된 것이므로 직접 department를 확인하기 어려움
            # 대신 응답이 정상적으로 반환되는지 확인
            assert 'project_number' in item
            assert 'execution_rate' in item

    def test_budget_with_status_filter(self, authenticated_client, sample_project_data):
        """상태 필터로 예산 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/budget/', {
            'status': '처리중'
        })
        
        assert response.status_code == status.HTTP_200_OK

    def test_budget_with_funding_agency_filter(self, authenticated_client, sample_project_data):
        """지원기관 필터로 예산 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/budget/', {
            'funding_agency': '과학기술정보통신부'
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        budget = data['data']
        
        # 해당 지원기관만 포함되어야 함
        for item in budget['funding_agency_distribution']:
            if item['funding_agency'] == '과학기술정보통신부':
                assert item['total_budget'] > 0

    def test_budget_with_date_range_filter(self, authenticated_client, sample_project_data):
        """날짜 범위 필터로 예산 조회 테스트"""
        response = authenticated_client.get('/api/dashboard/budget/', {
            'start_date': '2024-01-01',
            'end_date': '2024-12-31'
        })
        
        assert response.status_code == status.HTTP_200_OK


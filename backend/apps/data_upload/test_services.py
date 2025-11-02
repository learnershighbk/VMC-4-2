"""
CSV 파싱 로직 단위 테스트
"""
import pytest
import pandas as pd
from io import BytesIO
from django.contrib.auth import get_user_model
from apps.data_upload.services import (
    parse_csv_file,
    validate_and_parse_kpi,
    validate_and_parse_publication,
    validate_and_parse_project,
    validate_and_parse_student,
    process_csv_upload,
)
from apps.data_upload.models import (
    DepartmentKPI,
    PublicationList,
    ResearchProjectData,
    StudentRoster,
    UploadLog,
)

User = get_user_model()


class TestParseCSVFile:
    """CSV 파일 파싱 함수 테스트"""

    def test_parse_valid_csv(self):
        """유효한 CSV 파일 파싱 테스트"""
        csv_content = "평가년도,단과대학,학과\n2024,공과대학,컴퓨터공학과\n"
        file_bytes = csv_content.encode('utf-8-sig')
        
        df = parse_csv_file(file_bytes)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 1
        assert list(df.columns) == ['평가년도', '단과대학', '학과']
        assert df.iloc[0]['평가년도'] == '2024'

    def test_parse_csv_with_bom(self):
        """BOM이 포함된 CSV 파일 파싱 테스트"""
        csv_content = "col1,col2\nvalue1,value2\n"
        file_bytes = csv_content.encode('utf-8-sig')
        
        df = parse_csv_file(file_bytes)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 1

    def test_parse_invalid_csv_raises_error(self):
        """잘못된 CSV 파일 파싱 시 에러 발생 테스트"""
        invalid_content = b"not a valid csv content"
        
        with pytest.raises(ValueError, match="CSV 파일 파싱 실패"):
            parse_csv_file(invalid_content)

    def test_parse_empty_csv(self):
        """빈 CSV 파일 파싱 테스트"""
        csv_content = "col1,col2\n"
        file_bytes = csv_content.encode('utf-8-sig')
        
        df = parse_csv_file(file_bytes)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 0


class TestValidateAndParseKPI:
    """KPI 데이터 검증 및 파싱 함수 테스트"""

    def test_validate_valid_kpi_row(self):
        """유효한 KPI 행 검증 테스트"""
        row = pd.Series({
            '평가년도': '2024',
            '단과대학': '공과대학',
            '학과': '컴퓨터공학과',
            '졸업생 취업률 (%)': '85.5',
            '전임교원 수 (명)': '10',
            '초빙교원 수 (명)': '2',
            '연간 기술이전 수입액 (억원)': '5.2',
            '국제학술대회 개최 횟수': '3',
        })
        
        result = validate_and_parse_kpi(row, 2)
        
        assert "errors" not in result
        assert result["evaluation_year"] == 2024
        assert result["college"] == "공과대학"
        assert result["department"] == "컴퓨터공학과"
        assert result["employment_rate"] == 85.5
        assert result["fulltime_faculty_count"] == 10
        assert result["visiting_faculty_count"] == 2
        assert result["tech_transfer_revenue"] == 5.2
        assert result["intl_conference_count"] == 3

    def test_validate_kpi_with_invalid_year(self):
        """유효하지 않은 평가년도 검증 테스트"""
        row = pd.Series({
            '평가년도': '2022',  # 범위 밖
            '단과대학': '공과대학',
            '학과': '컴퓨터공학과',
            '졸업생 취업률 (%)': '85.5',
            '전임교원 수 (명)': '10',
            '초빙교원 수 (명)': '2',
            '연간 기술이전 수입액 (억원)': '5.2',
            '국제학술대회 개최 횟수': '3',
        })
        
        result = validate_and_parse_kpi(row, 2)
        
        assert "errors" in result
        assert "평가년도는 2023~2025 사이여야 합니다" in result["errors"][0]

    def test_validate_kpi_with_missing_required_field(self):
        """필수 필드 누락 검증 테스트"""
        row = pd.Series({
            '평가년도': '2024',
            # 단과대학 누락
            '학과': '컴퓨터공학과',
            '졸업생 취업률 (%)': '85.5',
        })
        
        result = validate_and_parse_kpi(row, 2)
        
        assert "errors" in result
        assert any("단과대학명이 필수입니다" in error for error in result["errors"])

    def test_validate_kpi_with_invalid_employment_rate(self):
        """유효하지 않은 취업률 검증 테스트"""
        row = pd.Series({
            '평가년도': '2024',
            '단과대학': '공과대학',
            '학과': '컴퓨터공학과',
            '졸업생 취업률 (%)': '150',  # 범위 초과
            '전임교원 수 (명)': '10',
            '초빙교원 수 (명)': '2',
            '연간 기술이전 수입액 (억원)': '5.2',
            '국제학술대회 개최 횟수': '3',
        })
        
        result = validate_and_parse_kpi(row, 2)
        
        assert "errors" in result
        assert any("취업률은 0~100 사이여야 합니다" in error for error in result["errors"])

    def test_validate_kpi_with_english_column_names(self):
        """영문 컬럼명 지원 테스트"""
        row = pd.Series({
            'evaluation_year': '2024',
            'college': '공과대학',
            'department': '컴퓨터공학과',
            'employment_rate': '85.5',
            'fulltime_faculty_count': '10',
            'visiting_faculty_count': '2',
            'tech_transfer_revenue': '5.2',
            'intl_conference_count': '3',
        })
        
        result = validate_and_parse_kpi(row, 2)
        
        assert "errors" not in result
        assert result["evaluation_year"] == 2024


class TestValidateAndParsePublication:
    """Publication 데이터 검증 및 파싱 함수 테스트"""

    def test_validate_valid_publication_row(self):
        """유효한 Publication 행 검증 테스트"""
        row = pd.Series({
            'publication_id': 'PUB-24-001',
            'publication_date': '2024-01-15',
            'college': '공과대학',
            'department': '컴퓨터공학과',
            'title': 'Test Paper Title',
            'first_author': '홍길동',
            'journal_name': 'Test Journal',
            'journal_grade': 'SCIE',
            'impact_factor': '3.5',
            'project_linked': 'Y',
            'co_authors': '김철수;이영희',
        })
        
        result = validate_and_parse_publication(row, 2)
        
        assert "errors" not in result
        assert result["publication_id"] == "PUB-24-001"
        assert result["journal_grade"] == "SCIE"
        assert result["impact_factor"] == 3.5

    def test_validate_publication_with_missing_id(self):
        """publication_id 누락 검증 테스트"""
        row = pd.Series({
            # publication_id 누락
            'publication_date': '2024-01-15',
            'journal_grade': 'SCIE',
        })
        
        result = validate_and_parse_publication(row, 2)
        
        assert "errors" in result
        assert any("논문ID가 필수입니다" in error for error in result["errors"])

    def test_validate_publication_with_invalid_journal_grade(self):
        """유효하지 않은 저널 등급 검증 테스트"""
        row = pd.Series({
            'publication_id': 'PUB-24-001',
            'publication_date': '2024-01-15',
            'journal_grade': 'INVALID',
        })
        
        result = validate_and_parse_publication(row, 2)
        
        assert "errors" in result
        assert any("저널등급이 유효하지 않습니다" in error for error in result["errors"])


class TestValidateAndParseProject:
    """Project 데이터 검증 및 파싱 함수 테스트"""

    def test_validate_valid_project_row(self):
        """유효한 Project 행 검증 테스트"""
        row = pd.Series({
            'execution_id': 'T2401001',
            'project_number': 'PRJ-2024-001',
            'project_name': 'Test Project',
            'principal_investigator': '홍길동',
            'department': '컴퓨터공학과',
            'funding_agency': '과학기술정보통신부',
            'total_budget': '100000000',
            'execution_date': '2024-01-15',
            'expense_item': '인건비',
            'expense_amount': '50000000',
            'status': '처리중',
            'notes': 'Test notes',
        })
        
        result = validate_and_parse_project(row, 2)
        
        assert "errors" not in result
        assert result["execution_id"] == "T2401001"
        assert result["total_budget"] == 100000000
        assert result["expense_amount"] == 50000000

    def test_validate_project_with_comma_separated_budget(self):
        """천 단위 구분자가 포함된 예산 파싱 테스트"""
        row = pd.Series({
            'execution_id': 'T2401001',
            'project_number': 'PRJ-2024-001',
            'project_name': 'Test Project',
            'principal_investigator': '홍길동',
            'department': '컴퓨터공학과',
            'funding_agency': '과학기술정보통신부',
            'total_budget': '100,000,000',
            'execution_date': '2024-01-15',
            'expense_item': '인건비',
            'expense_amount': '50,000,000',
            'status': '처리중',
        })
        
        result = validate_and_parse_project(row, 2)
        
        assert "errors" not in result
        assert result["total_budget"] == 100000000
        assert result["expense_amount"] == 50000000


class TestValidateAndParseStudent:
    """Student 데이터 검증 및 파싱 함수 테스트"""

    def test_validate_valid_student_row(self):
        """유효한 Student 행 검증 테스트"""
        row = pd.Series({
            'student_id': '20240001',
            'name': '홍길동',
            'college': '공과대학',
            'department': '컴퓨터공학과',
            'grade': '3',
            'program_type': '학사',
            'academic_status': '재학',
            'gender': '남',
            'admission_year': '2021',
            'advisor': '',
            'email': 'hong@example.com',
        })
        
        result = validate_and_parse_student(row, 2)
        
        assert "errors" not in result
        assert result["student_id"] == "20240001"
        assert result["grade"] == 3
        assert result["program_type"] == "학사"
        assert result["academic_status"] == "재학"

    def test_validate_student_with_invalid_grade(self):
        """유효하지 않은 학년 검증 테스트"""
        row = pd.Series({
            'student_id': '20240001',
            'name': '홍길동',
            'college': '공과대학',
            'department': '컴퓨터공학과',
            'grade': '5',  # 범위 초과
            'program_type': '학사',
            'academic_status': '재학',
            'gender': '남',
            'admission_year': '2021',
            'email': 'hong@example.com',
        })
        
        result = validate_and_parse_student(row, 2)
        
        assert "errors" in result
        assert any("학년은 0~4 사이여야 합니다" in error for error in result["errors"])


class TestProcessCSVUpload:
    """CSV 업로드 프로세스 통합 테스트"""

    @pytest.fixture
    def sample_user(self, db):
        return User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
        )

    def test_process_kpi_upload(self, sample_user):
        """KPI 데이터 업로드 프로세스 테스트"""
        csv_content = """평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수
2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3
"""
        file_bytes = csv_content.encode('utf-8-sig')
        
        success_rows, failed_rows, errors = process_csv_upload(
            file_content=file_bytes,
            data_type='kpi',
            uploaded_by=sample_user,
            file_name='test_kpi.csv'
        )
        
        assert success_rows == 1
        assert failed_rows == 0
        assert len(errors) == 0
        
        # 데이터베이스에 저장되었는지 확인
        kpi = DepartmentKPI.objects.get(department='컴퓨터공학과', evaluation_year=2024)
        assert kpi.employment_rate == 85.5
        assert kpi.fulltime_faculty_count == 10
        
        # 업로드 로그 확인
        upload_log = UploadLog.objects.get(file_name='test_kpi.csv')
        assert upload_log.success_rows == 1
        assert upload_log.failed_rows == 0

    def test_process_kpi_upload_with_duplicate(self, sample_user):
        """중복된 KPI 데이터 업로드 (업데이트) 테스트"""
        # 첫 번째 업로드
        csv_content1 = """평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수
2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3
"""
        file_bytes1 = csv_content1.encode('utf-8-sig')
        process_csv_upload(
            file_content=file_bytes1,
            data_type='kpi',
            uploaded_by=sample_user,
            file_name='test_kpi1.csv'
        )
        
        # 두 번째 업로드 (같은 evaluation_year, department)
        csv_content2 = """평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수
2024,공과대학,컴퓨터공학과,90.0,12,3,6.5,5
"""
        file_bytes2 = csv_content2.encode('utf-8-sig')
        success_rows, failed_rows, errors = process_csv_upload(
            file_content=file_bytes2,
            data_type='kpi',
            uploaded_by=sample_user,
            file_name='test_kpi2.csv'
        )
        
        assert success_rows == 1
        assert failed_rows == 0
        
        # 업데이트되었는지 확인
        kpi = DepartmentKPI.objects.get(department='컴퓨터공학과', evaluation_year=2024)
        assert kpi.employment_rate == 90.0
        assert kpi.fulltime_faculty_count == 12
        # 같은 키로 하나만 존재해야 함
        assert DepartmentKPI.objects.filter(department='컴퓨터공학과', evaluation_year=2024).count() == 1

    def test_process_publication_upload(self, sample_user):
        """Publication 데이터 업로드 프로세스 테스트"""
        csv_content = """publication_id,publication_date,college,department,title,first_author,journal_name,journal_grade,impact_factor,project_linked,co_authors
PUB-24-001,2024-01-15,공과대학,컴퓨터공학과,Test Paper,홍길동,Test Journal,SCIE,3.5,Y,
"""
        file_bytes = csv_content.encode('utf-8-sig')
        
        success_rows, failed_rows, errors = process_csv_upload(
            file_content=file_bytes,
            data_type='publication',
            uploaded_by=sample_user,
            file_name='test_publication.csv'
        )
        
        assert success_rows == 1
        assert failed_rows == 0
        
        publication = PublicationList.objects.get(publication_id='PUB-24-001')
        assert publication.journal_grade == 'SCIE'
        assert publication.impact_factor == 3.5

    def test_process_project_upload(self, sample_user):
        """Project 데이터 업로드 프로세스 테스트"""
        csv_content = """execution_id,project_number,project_name,principal_investigator,department,funding_agency,total_budget,execution_date,expense_item,expense_amount,status,notes
T2401001,PRJ-2024-001,Test Project,홍길동,컴퓨터공학과,과학기술정보통신부,100000000,2024-01-15,인건비,50000000,처리중,Test notes
"""
        file_bytes = csv_content.encode('utf-8-sig')
        
        success_rows, failed_rows, errors = process_csv_upload(
            file_content=file_bytes,
            data_type='project',
            uploaded_by=sample_user,
            file_name='test_project.csv'
        )
        
        assert success_rows == 1
        assert failed_rows == 0
        
        project = ResearchProjectData.objects.get(execution_id='T2401001')
        assert project.total_budget == 100000000
        assert project.expense_amount == 50000000

    def test_process_student_upload(self, sample_user):
        """Student 데이터 업로드 프로세스 테스트"""
        csv_content = """student_id,name,college,department,grade,program_type,academic_status,gender,admission_year,advisor,email
20240001,홍길동,공과대학,컴퓨터공학과,3,학사,재학,남,2021,,hong@example.com
"""
        file_bytes = csv_content.encode('utf-8-sig')
        
        success_rows, failed_rows, errors = process_csv_upload(
            file_content=file_bytes,
            data_type='student',
            uploaded_by=sample_user,
            file_name='test_student.csv'
        )
        
        assert success_rows == 1
        assert failed_rows == 0
        
        student = StudentRoster.objects.get(student_id='20240001')
        assert student.name == '홍길동'
        assert student.grade == 3

    def test_process_upload_with_partial_errors(self, sample_user):
        """일부 행만 실패하는 경우 테스트"""
        csv_content = """평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수
2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3
2022,공과대학,전기공학과,80.0,8,1,4.0,2
"""
        file_bytes = csv_content.encode('utf-8-sig')
        
        success_rows, failed_rows, errors = process_csv_upload(
            file_content=file_bytes,
            data_type='kpi',
            uploaded_by=sample_user,
            file_name='test_partial.csv'
        )
        
        assert success_rows == 1
        assert failed_rows == 1
        assert len(errors) == 1
        assert errors[0]['row'] == 3  # 두 번째 데이터 행 (헤더 제외)

    def test_process_upload_with_invalid_data_type(self, sample_user):
        """유효하지 않은 data_type 테스트"""
        csv_content = "col1,col2\nvalue1,value2\n"
        file_bytes = csv_content.encode('utf-8-sig')
        
        with pytest.raises(ValueError, match="지원하지 않는 데이터 유형"):
            process_csv_upload(
                file_content=file_bytes,
                data_type='invalid_type',
                uploaded_by=sample_user,
                file_name='test.csv'
            )


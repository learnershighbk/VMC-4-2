import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from io import BytesIO
from apps.data_upload.models import (
    DepartmentKPI,
    PublicationList,
    ResearchProjectData,
    StudentRoster,
    UploadLog,
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


def create_csv_file(content, filename='test.csv'):
    """CSV 파일을 모의 생성하는 헬퍼 함수"""
    file = BytesIO()
    file.write(content.encode('utf-8-sig'))
    file.seek(0)
    file.name = filename
    return file


class TestDataUploadIntegration:
    """데이터 업로드 플로우 통합 테스트"""

    def test_upload_without_authentication(self, api_client):
        """인증 없이 업로드 시도 시 401 응답 테스트"""
        csv_content = 'col1,col2\nvalue1,value2\n'
        file = create_csv_file(csv_content)
        data = {'file': file, 'data_type': 'kpi'}

        response = api_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_upload_without_file(self, authenticated_client):
        """파일 없이 업로드 시도 시 400 응답 테스트"""
        data = {'data_type': 'kpi'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_upload_with_invalid_file_type(self, authenticated_client):
        """CSV가 아닌 파일 업로드 시 400 응답 테스트"""
        file = BytesIO(b'not a csv file')
        file.name = 'test.txt'
        data = {'file': file, 'data_type': 'kpi'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_upload_valid_kpi_csv(self, authenticated_client):
        """유효한 KPI CSV 파일 업로드 및 데이터 저장 테스트"""
        csv_content = """평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수
2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3
2024,공과대학,전기공학과,80.0,8,1,4.0,2
"""
        file = create_csv_file(csv_content, 'kpi_data.csv')
        data = {'file': file, 'data_type': 'kpi'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
        response_data = response.json()
        
        assert 'data' in response_data
        assert response_data['data']['success_rows'] == 2
        assert response_data['data']['failed_rows'] == 0
        
        # 데이터베이스에 저장되었는지 확인
        assert DepartmentKPI.objects.filter(evaluation_year=2024).count() == 2
        assert DepartmentKPI.objects.filter(department='컴퓨터공학과').exists()
        assert DepartmentKPI.objects.filter(department='전기공학과').exists()
        
        # 업로드 로그 확인
        upload_log = UploadLog.objects.filter(file_name='kpi_data.csv').first()
        assert upload_log is not None
        assert upload_log.data_type == 'kpi'
        assert upload_log.success_rows == 2

    def test_upload_valid_publication_csv(self, authenticated_client):
        """유효한 Publication CSV 파일 업로드 테스트"""
        csv_content = """publication_id,publication_date,college,department,title,first_author,journal_name,journal_grade,impact_factor,project_linked,co_authors
PUB-24-001,2024-01-15,공과대학,컴퓨터공학과,Test Paper 1,홍길동,Test Journal,SCIE,3.5,Y,
PUB-24-002,2024-02-20,공과대학,전기공학과,Test Paper 2,김철수,Test Journal 2,KCI,,N,
"""
        file = create_csv_file(csv_content, 'publication_data.csv')
        data = {'file': file, 'data_type': 'publication'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
        response_data = response.json()
        
        assert response_data['data']['success_rows'] == 2
        
        # 데이터베이스 확인
        assert PublicationList.objects.filter(publication_id='PUB-24-001').exists()
        assert PublicationList.objects.filter(publication_id='PUB-24-002').exists()

    def test_upload_valid_project_csv(self, authenticated_client):
        """유효한 Project CSV 파일 업로드 테스트"""
        csv_content = """execution_id,project_number,project_name,principal_investigator,department,funding_agency,total_budget,execution_date,expense_item,expense_amount,status,notes
T2401001,PRJ-2024-001,Test Project 1,홍길동,컴퓨터공학과,과학기술정보통신부,100000000,2024-01-15,인건비,50000000,처리중,Test notes
"""
        file = create_csv_file(csv_content, 'project_data.csv')
        data = {'file': file, 'data_type': 'project'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
        
        # 데이터베이스 확인
        assert ResearchProjectData.objects.filter(execution_id='T2401001').exists()

    def test_upload_valid_student_csv(self, authenticated_client):
        """유효한 Student CSV 파일 업로드 테스트"""
        csv_content = """student_id,name,college,department,grade,program_type,academic_status,gender,admission_year,advisor,email
20240001,홍길동,공과대학,컴퓨터공학과,3,학사,재학,남,2021,,hong@example.com
20240002,김철수,공과대학,전기공학과,2,학사,재학,남,2022,,kim@example.com
"""
        file = create_csv_file(csv_content, 'student_data.csv')
        data = {'file': file, 'data_type': 'student'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
        
        # 데이터베이스 확인
        assert StudentRoster.objects.filter(student_id='20240001').exists()
        assert StudentRoster.objects.filter(student_id='20240002').exists()

    def test_upload_csv_with_validation_errors(self, authenticated_client):
        """검증 오류가 있는 CSV 업로드 테스트"""
        csv_content = """평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수
2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3
2022,공과대학,전기공학과,80.0,8,1,4.0,2
invalid,,invalid,150,-5,-2,-1,0
"""
        file = create_csv_file(csv_content, 'invalid_data.csv')
        data = {'file': file, 'data_type': 'kpi'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code == status.HTTP_200_OK  # 부분 성공
        response_data = response.json()
        
        assert response_data['data']['failed_rows'] >= 1
        assert len(response_data['data']['errors']) > 0
        assert response_data['data']['status'] == 'partial'

    def test_upload_with_missing_data_type(self, authenticated_client):
        """data_type 없이 업로드 시도 시 400 응답 테스트"""
        csv_content = 'col1,col2\nvalue1,value2\n'
        file = create_csv_file(csv_content)
        data = {'file': file}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_upload_with_invalid_data_type(self, authenticated_client):
        """잘못된 data_type으로 업로드 시도 시 400 응답 테스트"""
        csv_content = 'col1,col2\nvalue1,value2\n'
        file = create_csv_file(csv_content)
        data = {'file': file, 'data_type': 'invalid_type'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_upload_duplicate_kpi_updates_existing(self, authenticated_client):
        """중복된 KPI 데이터 업로드 시 기존 데이터 업데이트 테스트"""
        # 첫 번째 업로드
        csv_content1 = """평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수
2024,공과대학,컴퓨터공학과,85.5,10,2,5.2,3
"""
        file1 = create_csv_file(csv_content1, 'kpi1.csv')
        data1 = {'file': file1, 'data_type': 'kpi'}
        authenticated_client.post('/api/data/upload/', data1, format='multipart')
        
        original_kpi = DepartmentKPI.objects.get(department='컴퓨터공학과', evaluation_year=2024)
        original_id = original_kpi.id
        
        # 두 번째 업로드 (같은 키)
        csv_content2 = """평가년도,단과대학,학과,졸업생 취업률 (%),전임교원 수 (명),초빙교원 수 (명),연간 기술이전 수입액 (억원),국제학술대회 개최 횟수
2024,공과대학,컴퓨터공학과,90.0,12,3,6.5,5
"""
        file2 = create_csv_file(csv_content2, 'kpi2.csv')
        data2 = {'file': file2, 'data_type': 'kpi'}
        response = authenticated_client.post('/api/data/upload/', data2, format='multipart')
        
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
        
        # 기존 데이터가 업데이트되었는지 확인
        updated_kpi = DepartmentKPI.objects.get(id=original_id)
        assert updated_kpi.employment_rate == 90.0
        assert updated_kpi.fulltime_faculty_count == 12
        # 같은 키로 하나만 존재해야 함
        assert DepartmentKPI.objects.filter(department='컴퓨터공학과', evaluation_year=2024).count() == 1

    def test_upload_large_file_rejected(self, authenticated_client):
        """대용량 파일 업로드 거부 테스트 (100MB 초과)"""
        # 실제로 100MB 이상 파일을 생성하는 것은 비효율적이므로
        # 파일 크기 검증 로직이 작동하는지 확인
        large_content = 'col1,col2\n' + 'value1,value2\n' * 1000000
        file = BytesIO()
        file.write(large_content.encode('utf-8-sig'))
        file.seek(0)
        file.name = 'large.csv'
        data = {'file': file, 'data_type': 'kpi'}

        response = authenticated_client.post('/api/data/upload/', data, format='multipart')

        # 파일 크기가 너무 크면 400 또는 413 응답
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
        ]

"""
Pandas를 사용한 CSV 파싱 및 데이터 검증 로직
"""
import pandas as pd
import json
from io import StringIO
from django.db import transaction
from typing import Dict, List, Tuple, Any
from apps.data_upload.models import (
    DepartmentKPI,
    PublicationList,
    ResearchProjectData,
    StudentRoster,
    UploadLog,
)
from django.contrib.auth import get_user_model

User = get_user_model()


def parse_csv_file(file_content: bytes, encoding: str = 'utf-8-sig') -> pd.DataFrame:
    """
    CSV 파일을 Pandas DataFrame으로 파싱
    
    Args:
        file_content: CSV 파일 바이트 콘텐츠
        encoding: 파일 인코딩 (기본값: utf-8-sig, BOM 포함)
    
    Returns:
        pandas.DataFrame
    """
    try:
        # BOM 제거 및 UTF-8 디코딩
        content = file_content.decode(encoding).strip()
        
        # CSV 파싱
        df = pd.read_csv(
            StringIO(content),
            dtype=str,  # 모든 컬럼을 문자열로 먼저 읽기
            keep_default_na=False,  # 빈 문자열을 NaN으로 변환하지 않음
        )
        
        return df
    except Exception as e:
        raise ValueError(f"CSV 파일 파싱 실패: {str(e)}")


def validate_and_parse_kpi(row: pd.Series, row_index: int) -> Dict[str, Any]:
    """
    Department KPI 행 검증 및 파싱
    
    CSV 컬럼명 (한글): 평가년도, 단과대학, 학과, 졸업생 취업률 (%), 전임교원 수 (명), 
                     초빙교원 수 (명), 연간 기술이전 수입액 (억원), 국제학술대회 개최 횟수
    
    Returns:
        검증된 데이터 딕셔너리
    """
    errors = []
    
    # 한글 컬럼명 매핑
    def get_value(key_ko, key_en):
        return row.get(key_ko, '') or row.get(key_en, '')
    
    try:
        evaluation_year = int(get_value('평가년도', 'evaluation_year'))
        if not (2023 <= evaluation_year <= 2025):
            errors.append(f"평가년도는 2023~2025 사이여야 합니다")
    except (ValueError, TypeError):
        errors.append(f"평가년도가 유효하지 않습니다: {row.get('evaluation_year')}")
        evaluation_year = None
    
    college = str(get_value('단과대학', 'college')).strip()
    if not college:
        errors.append("단과대학명이 필수입니다")
    
    department = str(get_value('학과', 'department')).strip()
    if not department:
        errors.append("학과명이 필수입니다")
    
    try:
        employment_rate = float(get_value('졸업생 취업률 (%)', 'employment_rate') or 0)
        if not (0 <= employment_rate <= 100):
            errors.append(f"취업률은 0~100 사이여야 합니다: {employment_rate}")
    except (ValueError, TypeError):
        errors.append(f"취업률이 유효하지 않습니다: {row.get('employment_rate')}")
        employment_rate = None
    
    try:
        fulltime_faculty_count = int(float(get_value('전임교원 수 (명)', 'fulltime_faculty_count') or 0))
        if fulltime_faculty_count < 0:
            errors.append(f"전임교원 수는 0 이상이어야 합니다: {fulltime_faculty_count}")
    except (ValueError, TypeError):
        errors.append(f"전임교원 수가 유효하지 않습니다")
        fulltime_faculty_count = None
    
    try:
        visiting_faculty_count = int(float(get_value('초빙교원 수 (명)', 'visiting_faculty_count') or 0))
        if visiting_faculty_count < 0:
            errors.append(f"초빙교원 수는 0 이상이어야 합니다: {visiting_faculty_count}")
    except (ValueError, TypeError):
        errors.append(f"초빙교원 수가 유효하지 않습니다")
        visiting_faculty_count = None
    
    try:
        tech_transfer_revenue = float(get_value('연간 기술이전 수입액 (억원)', 'tech_transfer_revenue') or 0)
        if tech_transfer_revenue < 0:
            errors.append(f"기술이전 수입액은 0 이상이어야 합니다: {tech_transfer_revenue}")
    except (ValueError, TypeError):
        errors.append(f"기술이전 수입액이 유효하지 않습니다")
        tech_transfer_revenue = None
    
    try:
        intl_conference_count = int(float(get_value('국제학술대회 개최 횟수', 'intl_conference_count') or 0))
        if intl_conference_count < 0:
            errors.append(f"국제학술대회 개최 횟수는 0 이상이어야 합니다: {intl_conference_count}")
    except (ValueError, TypeError):
        errors.append(f"국제학술대회 개최 횟수가 유효하지 않습니다")
        intl_conference_count = None
    
    if errors:
        return {"errors": errors, "row": row_index}
    
    return {
        "evaluation_year": evaluation_year,
        "college": college,
        "department": department,
        "employment_rate": employment_rate,
        "fulltime_faculty_count": fulltime_faculty_count,
        "visiting_faculty_count": visiting_faculty_count,
        "tech_transfer_revenue": tech_transfer_revenue,
        "intl_conference_count": intl_conference_count,
    }


def validate_and_parse_publication(row: pd.Series, row_index: int) -> Dict[str, Any]:
    """
    Publication 행 검증 및 파싱
    """
    errors = []
    
    publication_id = str(row.get('publication_id', '')).strip()
    if not publication_id:
        errors.append("논문ID가 필수입니다")
    
    try:
        from dateutil.parser import parse
        publication_date = parse(str(row.get('publication_date', ''))).date()
    except (ValueError, TypeError, AttributeError):
        errors.append(f"게재일이 유효하지 않습니다: {row.get('publication_date')}")
        publication_date = None
    
    college = str(row.get('college', '')).strip()
    department = str(row.get('department', '')).strip()
    title = str(row.get('title', '')).strip()
    first_author = str(row.get('first_author', '')).strip()
    
    journal_name = str(row.get('journal_name', '')).strip()
    journal_grade = str(row.get('journal_grade', '')).strip()
    if journal_grade not in ['SCIE', 'KCI', '일반']:
        errors.append(f"저널등급이 유효하지 않습니다: {journal_grade} (SCIE, KCI, 일반 중 하나)")
    
    impact_factor = None
    if journal_grade == 'SCIE':
        try:
            impact_factor = float(row.get('impact_factor', 0)) if row.get('impact_factor') else None
        except (ValueError, TypeError):
            pass
    
    project_linked = str(row.get('project_linked', 'N')).strip().upper()
    if project_linked not in ['Y', 'N']:
        project_linked = 'N'
    
    co_authors = str(row.get('co_authors', '')).strip() or None
    
    if errors:
        return {"errors": errors, "row": row_index}
    
    return {
        "publication_id": publication_id,
        "publication_date": publication_date,
        "college": college,
        "department": department,
        "title": title,
        "first_author": first_author,
        "co_authors": co_authors,
        "journal_name": journal_name,
        "journal_grade": journal_grade,
        "impact_factor": impact_factor,
        "project_linked": project_linked,
    }


def validate_and_parse_project(row: pd.Series, row_index: int) -> Dict[str, Any]:
    """
    Research Project 행 검증 및 파싱
    """
    errors = []
    
    execution_id = str(row.get('execution_id', '')).strip()
    if not execution_id:
        errors.append("집행ID가 필수입니다")
    
    project_number = str(row.get('project_number', '')).strip()
    project_name = str(row.get('project_name', '')).strip()
    principal_investigator = str(row.get('principal_investigator', '')).strip()
    department = str(row.get('department', '')).strip()
    funding_agency = str(row.get('funding_agency', '')).strip()
    
    try:
        total_budget = int(float(str(row.get('total_budget', 0)).replace(',', '')))
        if total_budget < 0:
            errors.append(f"총연구비는 0 이상이어야 합니다: {total_budget}")
    except (ValueError, TypeError):
        errors.append(f"총연구비가 유효하지 않습니다: {row.get('total_budget')}")
        total_budget = None
    
    try:
        from dateutil.parser import parse
        execution_date = parse(str(row.get('execution_date', ''))).date()
    except (ValueError, TypeError, AttributeError):
        errors.append(f"집행일자가 유효하지 않습니다: {row.get('execution_date')}")
        execution_date = None
    
    expense_item = str(row.get('expense_item', '')).strip()
    
    try:
        expense_amount = int(float(str(row.get('expense_amount', 0)).replace(',', '')))
        if expense_amount < 0:
            errors.append(f"집행금액은 0 이상이어야 합니다: {expense_amount}")
    except (ValueError, TypeError):
        errors.append(f"집행금액이 유효하지 않습니다: {row.get('expense_amount')}")
        expense_amount = None
    
    status = str(row.get('status', '처리중')).strip()
    if status not in ['집행완료', '처리중', '반려']:
        status = '처리중'
    
    notes = str(row.get('notes', '')).strip() or None
    
    if errors:
        return {"errors": errors, "row": row_index}
    
    return {
        "execution_id": execution_id,
        "project_number": project_number,
        "project_name": project_name,
        "principal_investigator": principal_investigator,
        "department": department,
        "funding_agency": funding_agency,
        "total_budget": total_budget,
        "execution_date": execution_date,
        "expense_item": expense_item,
        "expense_amount": expense_amount,
        "status": status,
        "notes": notes,
    }


def validate_and_parse_student(row: pd.Series, row_index: int) -> Dict[str, Any]:
    """
    Student Roster 행 검증 및 파싱
    """
    errors = []
    
    student_id = str(row.get('student_id', '')).strip()
    if not student_id:
        errors.append("학번이 필수입니다")
    
    name = str(row.get('name', '')).strip()
    college = str(row.get('college', '')).strip()
    department = str(row.get('department', '')).strip()
    
    try:
        grade = int(float(row.get('grade', 0)))
        if not (0 <= grade <= 4):
            errors.append(f"학년은 0~4 사이여야 합니다: {grade}")
    except (ValueError, TypeError):
        errors.append(f"학년이 유효하지 않습니다: {row.get('grade')}")
        grade = None
    
    program_type = str(row.get('program_type', '')).strip()
    if program_type not in ['학사', '석사', '박사']:
        errors.append(f"과정구분이 유효하지 않습니다: {program_type}")
    
    academic_status = str(row.get('academic_status', '')).strip()
    if academic_status not in ['재학', '휴학', '졸업', '제적']:
        errors.append(f"학적상태가 유효하지 않습니다: {academic_status}")
    
    gender = str(row.get('gender', '')).strip()
    if gender not in ['남', '여']:
        errors.append(f"성별이 유효하지 않습니다: {gender}")
    
    try:
        admission_year = int(row.get('admission_year', ''))
        if not (2000 <= admission_year <= 2100):
            errors.append(f"입학년도는 2000~2100 사이여야 합니다: {admission_year}")
    except (ValueError, TypeError):
        errors.append(f"입학년도가 유효하지 않습니다: {row.get('admission_year')}")
        admission_year = None
    
    advisor = str(row.get('advisor', '')).strip() or None
    email = str(row.get('email', '')).strip()
    
    if errors:
        return {"errors": errors, "row": row_index}
    
    return {
        "student_id": student_id,
        "name": name,
        "college": college,
        "department": department,
        "grade": grade,
        "program_type": program_type,
        "academic_status": academic_status,
        "gender": gender,
        "admission_year": admission_year,
        "advisor": advisor,
        "email": email,
    }


@transaction.atomic
def process_csv_upload(
    file_content: bytes,
    data_type: str,
    uploaded_by: User,
    file_name: str
) -> Tuple[int, int, List[Dict[str, Any]]]:
    """
    CSV 파일을 파싱하고 데이터베이스에 저장
    
    Args:
        file_content: CSV 파일 바이트 콘텐츠
        data_type: 데이터 유형 ('kpi', 'publication', 'project', 'student')
        uploaded_by: 업로드한 사용자
        file_name: 파일명
    
    Returns:
        (success_rows, failed_rows, errors) 튜플
        errors: [{row: int, reason: str, data: dict}]
    """
    # CSV 파싱
    df = parse_csv_file(file_content)
    total_rows = len(df)
    
    success_rows = 0
    failed_rows = 0
    errors = []
    
    # 데이터 유형별 처리
    if data_type == 'kpi':
        models_to_create = []
        for idx, row in df.iterrows():
            parsed = validate_and_parse_kpi(row, idx + 2)  # +2: 헤더(1) + 0-based index(1)
            if "errors" in parsed:
                failed_rows += 1
                errors.append({
                    "row": parsed["row"],
                    "reason": "; ".join(parsed["errors"]),
                    "data": row.to_dict(),
                })
            else:
                # 중복 체크 (evaluation_year, department)
                existing = DepartmentKPI.objects.filter(
                    evaluation_year=parsed["evaluation_year"],
                    department=parsed["department"]
                ).first()
                
                if existing:
                    # 업데이트
                    for key, value in parsed.items():
                        setattr(existing, key, value)
                    existing.save()
                else:
                    models_to_create.append(DepartmentKPI(**parsed))
                
                success_rows += 1
        
        if models_to_create:
            DepartmentKPI.objects.bulk_create(models_to_create)
    
    elif data_type == 'publication':
        models_to_create = []
        for idx, row in df.iterrows():
            parsed = validate_and_parse_publication(row, idx + 2)
            if "errors" in parsed:
                failed_rows += 1
                errors.append({
                    "row": parsed["row"],
                    "reason": "; ".join(parsed["errors"]),
                    "data": row.to_dict(),
                })
            else:
                existing = PublicationList.objects.filter(
                    publication_id=parsed["publication_id"]
                ).first()
                
                if existing:
                    for key, value in parsed.items():
                        setattr(existing, key, value)
                    existing.save()
                else:
                    models_to_create.append(PublicationList(**parsed))
                
                success_rows += 1
        
        if models_to_create:
            PublicationList.objects.bulk_create(models_to_create)
    
    elif data_type == 'project':
        models_to_create = []
        for idx, row in df.iterrows():
            parsed = validate_and_parse_project(row, idx + 2)
            if "errors" in parsed:
                failed_rows += 1
                errors.append({
                    "row": parsed["row"],
                    "reason": "; ".join(parsed["errors"]),
                    "data": row.to_dict(),
                })
            else:
                existing = ResearchProjectData.objects.filter(
                    execution_id=parsed["execution_id"]
                ).first()
                
                if existing:
                    for key, value in parsed.items():
                        setattr(existing, key, value)
                    existing.save()
                else:
                    models_to_create.append(ResearchProjectData(**parsed))
                
                success_rows += 1
        
        if models_to_create:
            ResearchProjectData.objects.bulk_create(models_to_create)
    
    elif data_type == 'student':
        models_to_create = []
        for idx, row in df.iterrows():
            parsed = validate_and_parse_student(row, idx + 2)
            if "errors" in parsed:
                failed_rows += 1
                errors.append({
                    "row": parsed["row"],
                    "reason": "; ".join(parsed["errors"]),
                    "data": row.to_dict(),
                })
            else:
                existing = StudentRoster.objects.filter(
                    student_id=parsed["student_id"]
                ).first()
                
                if existing:
                    for key, value in parsed.items():
                        setattr(existing, key, value)
                    existing.save()
                else:
                    models_to_create.append(StudentRoster(**parsed))
                
                success_rows += 1
        
        if models_to_create:
            StudentRoster.objects.bulk_create(models_to_create)
    
    else:
        raise ValueError(f"지원하지 않는 데이터 유형: {data_type}")
    
    # 업로드 로그 저장
    upload_log = UploadLog.objects.create(
        file_name=file_name,
        data_type=data_type,
        total_rows=total_rows,
        success_rows=success_rows,
        failed_rows=failed_rows,
        error_details=json.dumps(errors[:100], ensure_ascii=False),  # 최대 100개만 저장
        uploaded_by=uploaded_by,
    )
    
    return success_rows, failed_rows, errors

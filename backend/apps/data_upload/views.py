from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.uploadedfile import InMemoryUploadedFile
from config.responses import success_response, error_response
from .services import process_csv_upload
from .models import UploadLog
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import json


class UploadPagination(PageNumberPagination):
    """업로드 이력 페이지네이션"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UploadView(APIView):
    """
    CSV 파일 업로드 API
    POST /api/data/upload/
    """
    
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """
        CSV 파일을 업로드하고 파싱하여 데이터베이스에 저장합니다.
        
        Request:
        - file: CSV 파일 (multipart/form-data)
        - data_type: 데이터 유형 ('kpi', 'publication', 'project', 'student')
        """
        file = request.FILES.get('file')
        data_type = request.data.get('data_type')
        
        # 유효성 검증
        if not file:
            return error_response("파일이 제공되지 않았습니다.", status_code=400)
        
        if not data_type:
            return error_response("데이터 유형(data_type)이 제공되지 않았습니다.", status_code=400)
        
        if data_type not in ['kpi', 'publication', 'project', 'student']:
            return error_response(
                f"지원하지 않는 데이터 유형: {data_type}. (kpi, publication, project, student 중 하나)",
                status_code=400
            )
        
        if not file.name.endswith('.csv'):
            return error_response("CSV 파일만 업로드 가능합니다.", status_code=400)
        
        # 파일 크기 제한 (100MB)
        if file.size > 100 * 1024 * 1024:
            return error_response("파일 크기는 100MB를 초과할 수 없습니다.", status_code=400)
        
        try:
            # 파일 내용 읽기
            file_content = file.read()
            
            # CSV 처리
            success_rows, failed_rows, errors = process_csv_upload(
                file_content=file_content,
                data_type=data_type,
                uploaded_by=request.user,
                file_name=file.name
            )
            
            # 최근 업로드 로그 조회
            upload_log = UploadLog.objects.filter(
                uploaded_by=request.user,
                file_name=file.name
            ).order_by('-created_at').first()
            
            response_data = {
                "status": "success" if failed_rows == 0 else "partial",
                "message": f"파일 처리 완료. 성공: {success_rows}행, 실패: {failed_rows}행",
                "upload_id": str(upload_log.id) if upload_log else None,
                "total_rows": success_rows + failed_rows,
                "success_rows": success_rows,
                "failed_rows": failed_rows,
                "errors": errors[:50],  # 최대 50개만 반환
            }
            
            if failed_rows == 0:
                return success_response(response_data, status_code=201)
            else:
                return success_response(response_data, status_code=200)
        
        except ValueError as e:
            return error_response(str(e), status_code=400)
        except Exception as e:
            return error_response(f"파일 처리 중 오류가 발생했습니다: {str(e)}", status_code=500)


class UploadLogListView(APIView):
    """
    업로드 이력 목록 조회 API
    GET /api/data/upload-logs/
    """
    
    permission_classes = [IsAuthenticated]
    pagination_class = UploadPagination
    
    def get(self, request):
        """
        업로드 이력을 조회합니다.
        
        Query Parameters:
        - page: 페이지 번호
        - page_size: 페이지당 항목 수
        - data_type: 데이터 유형 필터
        """
        data_type = request.query_params.get('data_type')
        
        queryset = UploadLog.objects.filter(uploaded_by=request.user).order_by('-created_at')
        
        if data_type:
            queryset = queryset.filter(data_type=data_type)
        
        # 페이지네이션
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer_data = []
            for log in page:
                serializer_data.append({
                    "id": str(log.id),
                    "file_name": log.file_name,
                    "data_type": log.data_type,
                    "total_rows": log.total_rows,
                    "success_rows": log.success_rows,
                    "failed_rows": log.failed_rows,
                    "uploaded_by": {
                        "id": log.uploaded_by.id,
                        "username": log.uploaded_by.username,
                    },
                    "created_at": log.created_at.isoformat(),
                })
            
            return paginator.get_paginated_response(serializer_data)
        
        # 페이지네이션 없이 전체 반환 (권장하지 않음)
        serializer_data = []
        for log in queryset:
            serializer_data.append({
                "id": str(log.id),
                "file_name": log.file_name,
                "data_type": log.data_type,
                "total_rows": log.total_rows,
                "success_rows": log.success_rows,
                "failed_rows": log.failed_rows,
                "uploaded_by": {
                    "id": log.uploaded_by.id,
                    "username": log.uploaded_by.username,
                },
                "created_at": log.created_at.isoformat(),
            })
        
        return success_response(serializer_data)


class UploadLogDetailView(APIView):
    """
    업로드 이력 상세 조회 API
    GET /api/data/upload-logs/{id}/
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """
        특정 업로드 이력의 상세 정보를 조회합니다.
        """
        try:
            upload_log = UploadLog.objects.get(pk=pk, uploaded_by=request.user)
        except UploadLog.DoesNotExist:
            return error_response("업로드 이력을 찾을 수 없습니다.", status_code=404)
        
        # 오류 상세 정보 파싱
        error_details = []
        if upload_log.error_details:
            try:
                error_details = json.loads(upload_log.error_details)
            except json.JSONDecodeError:
                error_details = []
        
        response_data = {
            "id": str(upload_log.id),
            "file_name": upload_log.file_name,
            "data_type": upload_log.data_type,
            "total_rows": upload_log.total_rows,
            "success_rows": upload_log.success_rows,
            "failed_rows": upload_log.failed_rows,
            "error_details": error_details,
            "uploaded_by": {
                "id": upload_log.uploaded_by.id,
                "username": upload_log.uploaded_by.username,
            },
            "created_at": upload_log.created_at.isoformat(),
            "updated_at": upload_log.updated_at.isoformat(),
        }
        
        return success_response(response_data)

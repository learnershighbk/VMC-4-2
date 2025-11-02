"""
Django REST Framework 커스텀 응답 유틸리티
모든 API가 { success: boolean, data: {...} } 형식으로 통일된 응답을 반환하도록 함
"""
from rest_framework.response import Response
from rest_framework import status


def success_response(data, status_code=status.HTTP_200_OK):
    """
    성공 응답 포맷
    { "success": true, "data": {...} }
    """
    return Response(
        {"success": True, "data": data},
        status=status_code
    )


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    에러 응답 포맷
    { "success": false, "detail": "Error message", "errors": {...} }
    """
    response_data = {"success": False, "detail": message}
    if errors:
        response_data["errors"] = errors
    return Response(response_data, status=status_code)


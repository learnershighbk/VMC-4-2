"""
대시보드 API 응답 시간 측정을 위한 미들웨어
"""
import time
import logging

logger = logging.getLogger(__name__)


class PerformanceLoggingMiddleware:
    """
    API 응답 시간을 측정하고 로깅하는 미들웨어
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 대시보드 API 요청만 측정
        if request.path.startswith('/api/dashboard/'):
            start_time = time.time()
            
            response = self.get_response(request)
            
            elapsed_time = time.time() - start_time
            elapsed_ms = round(elapsed_time * 1000, 2)
            
            # 응답 시간이 3초를 초과하면 WARNING 레벨로 로깅
            log_level = logging.WARNING if elapsed_ms > 3000 else logging.INFO
            
            logger.log(
                log_level,
                f"[Dashboard API] {request.method} {request.path} - "
                f"Response time: {elapsed_ms}ms (Status: {response.status_code})"
            )
            
            # 응답 헤더에 응답 시간 추가 (선택사항)
            response['X-Response-Time'] = f"{elapsed_ms}ms"
            
            return response
        
        return self.get_response(request)


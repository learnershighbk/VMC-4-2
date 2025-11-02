from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.authentication.serializers import RegisterSerializer, UserSerializer
from config.responses import success_response, error_response


# JWT 토큰 발급 및 갱신은 simplejwt가 제공하는 기본 View 사용
# 추가 커스터마이징이 필요한 경우 여기에 구현


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    회원가입 엔드포인트
    POST /api/auth/register/
    
    Request Body:
    {
        "username": "user123",
        "email": "user@example.com",
        "password": "securepassword123",
        "password_confirm": "securepassword123"
    }
    
    Response:
    {
        "access": "eyJhbGc...",
        "refresh": "eyJhbGc...",
        "user": {
            "id": "...",
            "username": "user123",
            "email": "user@example.com",
            ...
        }
    }
    """
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # 회원가입 후 자동 로그인을 위해 JWT 토큰 발급
        from rest_framework_simplejwt.tokens import RefreshToken
        
        refresh = RefreshToken.for_user(user)
        
        user_serializer = UserSerializer(user)
        
        return success_response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": user_serializer.data,
            },
            status_code=status.HTTP_201_CREATED,
        )
    
    return error_response("입력 데이터 검증 실패", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    현재 인증된 사용자 정보를 반환하는 엔드포인트
    GET /api/auth/me
    """
    serializer = UserSerializer(request.user)
    return success_response(serializer.data)

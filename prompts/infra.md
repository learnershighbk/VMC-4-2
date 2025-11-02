# 인프라 및 배포 명세서 (Infrastructure & Deployment Specification)

## 1. 개요 (Overview)
- 이 문서는 [docs/spec.md의 기술 스택]을 기반으로 Railway.app 배포 환경 설정 및 운영 가이드를 정의합니다.
- 프로덕션 환경에서 안정적이고 안전한 서비스 운영을 위한 모든 인프라 구성 요소를 포함합니다.

## 2. Railway 프로젝트 구성 (Railway Project Configuration)
> Railway 프로젝트 내 서비스 구성 및 설정을 명시합니다.

### 2.1. 서비스 구성
- **Frontend Service** (Next.js)
  - Build Command: `npm run build`
  - Start Command: `npm run start`
  - Port: `3000` (또는 Railway가 자동 할당)
  - Root Directory: 프로젝트 루트
  - Runtime: Node.js 20+
  - **특징:**
    - 프론트엔드 전용 서비스로 배포됩니다.
    - 백엔드 API를 별도 서비스로 호출합니다.

- **Backend Service** (Django REST Framework)
  - Build Command: `pip install -r backend/requirements.txt`
  - Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
  - Port: `8000` (또는 Railway가 자동 할당)
  - Root Directory: `backend/`
  - Runtime: Python 3.11+
  - **특징:**
    - Django REST Framework를 사용하여 API를 제공합니다.
    - Gunicorn을 웹 서버로 사용합니다.

- **Database Service** (PostgreSQL)
  - Type: PostgreSQL 14+
  - Auto-provisioned by Railway
  - **특징:**
    - Railway가 자동으로 프로비저닝하는 PostgreSQL 서비스를 사용합니다.
    - Django ORM을 통해 접근합니다.

### 2.2. 서비스 간 연결
- Frontend → Backend: `NEXT_PUBLIC_API_URL` 환경 변수로 백엔드 API URL 지정
- Backend → Database: `DATABASE_URL` 환경 변수를 통해 Railway PostgreSQL 연결

## 3. 환경 변수 관리 (Environment Variables)
> 각 서비스별 필수 환경 변수와 설정 값을 정의합니다.

### 3.1. Frontend Service (Next.js)
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[backend-service].railway.app
NEXT_PUBLIC_APP_URL=https://[frontend-service].railway.app
```

### 3.2. Backend Service (Django)
```
# Django Core
SECRET_KEY=[강력한 랜덤 문자열, 50자 이상]
DEBUG=False
ALLOWED_HOSTS=[frontend-domain].railway.app,[backend-domain].railway.app
CSRF_TRUSTED_ORIGINS=https://[frontend-domain].railway.app

# Database (Railway가 자동 제공)
DATABASE_URL=postgresql://user:password@host:port/dbname

# CORS 설정
CORS_ALLOWED_ORIGINS=https://[frontend-domain].railway.app

# 파일 업로드
MAX_UPLOAD_SIZE=104857600  # 100MB (bytes)
ALLOWED_UPLOAD_EXTENSIONS=.csv

# Session & Cookie
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
```

### 3.3. 환경 변수 보안 관리
- **절대 노출 금지:** `SECRET_KEY`, `DATABASE_URL`, 개인정보 관련 변수
- **Railway Secrets 사용:** 모든 민감한 정보는 Railway의 Variables 탭에서 안전하게 관리
- **`.env` 파일:** 로컬 개발용으로만 사용, `.gitignore`에 반드시 추가
- **환경별 분리:** 개발/스테이징/프로덕션 환경 변수를 별도로 관리
- **주의사항:**
  - `NEXT_PUBLIC_*` 접두사가 붙은 변수는 클라이언트 번들에 포함됩니다. 민감한 정보는 절대 포함하지 마세요.
  - `SECRET_KEY`는 Django의 보안에 필수적이며, 반드시 강력한 랜덤 문자열이어야 합니다.

## 4. HTTPS 및 SSL 설정 (HTTPS & SSL Configuration)
> Railway는 자동으로 HTTPS를 제공합니다.

### 4.1. 자동 SSL 인증서
- Railway가 Let's Encrypt를 통해 자동으로 SSL 인증서 발급 및 갱신
- Custom Domain 연결 시에도 자동 적용

### 4.2. HTTPS 강제 리디렉션
- Django settings에서 HTTPS 리디렉션 설정:
  ```python
  # backend/config/settings.py
  SECURE_SSL_REDIRECT = True
  SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
  ```

## 5. CI/CD 파이프라인 (CI/CD Pipeline)
> GitHub Actions를 통한 자동 배포 워크플로우를 정의합니다.

### 5.1. GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches:
      - main
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Trigger Railway Deployment
        run: |
          echo "Railway auto-deploys on push to main/develop"
          # Railway는 GitHub 연결 시 자동 배포됨

      - name: Run Tests (Optional)
        run: |
          # 테스트 실행
          npm test
          cd backend && python manage.py test
```

### 5.2. 배포 프로세스
1. **코드 Push:** 개발자가 `main` 브랜치에 코드 Push
2. **자동 감지:** Railway가 GitHub webhook을 통해 변경사항 감지
3. **빌드:** Railway가 자동으로 빌드 실행
4. **배포:** 빌드 성공 시 자동으로 프로덕션에 배포
5. **롤백:** 배포 실패 시 이전 버전으로 자동 롤백

### 5.3. 배포 전 체크리스트
- [ ] 모든 테스트 통과 확인
- [ ] 환경 변수 설정 확인
- [ ] Database 마이그레이션 적용 (`python manage.py migrate`)
- [ ] Static 파일 수집 (`python manage.py collectstatic`)
- [ ] `DEBUG=False` 설정 확인
- [ ] CORS 및 CSRF 설정 확인
- [ ] 프론트엔드/백엔드 빌드 성공 확인 (로컬 테스트)

## 6. 데이터베이스 관리 (Database Management)

### 6.1. 마이그레이션 전략
- **초기 배포:** `python manage.py migrate` 수동 실행
- **이후 배포:** Railway의 "Run on Deploy" 기능 활용하여 자동 마이그레이션
- **마이그레이션 파일:** Django의 `migrations/` 디렉토리에 자동 생성
- **배포 프로세스:**
  1. Django 모델 변경 시 `python manage.py makemigrations` 실행
  2. 마이그레이션 파일 커밋
  3. 배포 시 자동 또는 수동으로 `python manage.py migrate` 실행

### 6.2. 백업 전략
- **자동 백업:** Railway PostgreSQL은 자동 백업 제공 (Pro Plan 이상)
- **수동 백업:** 주기적으로 `pg_dump`를 통한 백업 수행
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```
- **백업 주기:** 일일 자동 백업, 주간 수동 백업
- **백업 보관:** 최근 30일간 백업 보관

### 6.3. 재해 복구 (Disaster Recovery)
- **복구 시간 목표 (RTO):** 4시간 이내
- **복구 시점 목표 (RPO):** 24시간 이내
- **복구 절차:**
  1. Railway의 자동 백업에서 최신 스냅샷 확인
  2. 새 PostgreSQL 서비스 프로비저닝
  3. 백업 데이터 복원: `psql $DATABASE_URL < backup.sql`
  4. 애플리케이션 서비스 재시작 및 연결 확인

## 7. 로그 관리 및 모니터링 (Logging & Monitoring)

### 7.1. 로그 수집
- **Railway Logs:** Railway 대시보드에서 실시간 로그 확인
- **Django Logging:**
  ```python
  # backend/config/settings.py
  LOGGING = {
      'version': 1,
      'disable_existing_loggers': False,
      'handlers': {
          'console': {
              'class': 'logging.StreamHandler',
          },
      },
      'root': {
          'handlers': ['console'],
          'level': 'INFO',
      },
  }
  ```

### 7.2. 모니터링 지표
- **필수 모니터링 항목:**
  - CPU 사용률 (임계치: 80%)
  - 메모리 사용률 (임계치: 85%)
  - 디스크 사용량 (임계치: 90%)
  - API 응답 시간 (목표: 3초 이내)
  - 데이터베이스 연결 수

### 7.3. 알림 설정
- **Railway 알림:** 배포 성공/실패 알림을 Slack 또는 이메일로 수신
- **에러 알림:** 5xx 에러 발생 시 즉시 알림

## 8. 보안 체크리스트 (Security Checklist)
> 프로덕션 배포 전 반드시 확인해야 할 보안 항목입니다.

- [ ] `SECRET_KEY`가 강력한 랜덤 문자열로 설정되었는가?
- [ ] `DEBUG=False`로 설정되었는가?
- [ ] `ALLOWED_HOSTS`가 정확한 도메인으로 제한되었는가?
- [ ] HTTPS가 강제 적용되는가? (`SECURE_SSL_REDIRECT=True`)
- [ ] CSRF 보호가 활성화되었는가?
- [ ] CORS 설정이 필요한 도메인으로만 제한되었는가?
- [ ] 데이터베이스 접근이 안전하게 관리되는가?
- [ ] 파일 업로드 크기 및 확장자 제한이 설정되었는가?
- [ ] 세션 쿠키가 `Secure`, `HttpOnly` 플래그로 설정되었는가?
- [ ] Django REST Framework의 인증/권한 설정이 적절히 구성되었는가?

## 9. 성능 최적화 (Performance Optimization)

### 9.1. 캐싱 전략
- **Django 캐싱:** Redis 또는 Django의 로컬 메모리 캐시 사용
- **API 응답 캐싱:** `@tanstack/react-query`를 통한 클라이언트 측 캐싱
- **CDN:** Static 파일은 Railway의 자동 CDN 활용

### 9.2. 데이터베이스 최적화
- **인덱스:** 자주 조회하는 필드에 인덱스 추가 (Django Model Meta에서 설정)
- **쿼리 최적화:** N+1 쿼리 문제 방지, `select_related`/`prefetch_related` 활용
- **Connection Pooling:** PostgreSQL의 connection pooling 활용

### 9.3. 확장성 (Scalability)
- **수평 확장:** Railway의 Autoscaling 기능 활용 (Pro Plan 이상)
- **수직 확장:** 필요 시 Railway에서 서비스 리소스 증설

## 10. 운영 가이드 (Operations Guide)

### 10.1. 일상 운영 작업
- **일일:** 로그 확인, 에러율 모니터링
- **주간:** 백업 확인, 데이터베이스 성능 점검
- **월간:** 보안 패치 적용, 의존성 업데이트

### 10.2. 긴급 대응 절차
1. **서비스 중단 시:**
   - Railway 대시보드에서 서비스 상태 확인
   - 로그 확인하여 에러 원인 파악
   - 필요 시 이전 배포 버전으로 롤백
   - 문제 해결 후 재배포

2. **데이터 손실 시:**
   - 즉시 서비스 중단 (추가 손실 방지)
   - 최신 백업에서 데이터 복원
   - 데이터 무결성 검증 후 서비스 재개

### 10.3. 배포 롤백 절차
```bash
# Railway CLI를 통한 롤백 (선택사항)
railway rollback [deployment-id]
```

## 11. 비용 관리 (Cost Management)
> Railway 사용 비용을 효율적으로 관리합니다.

### 11.1. 예상 비용
- **Starter Plan:** $5/월 (개발/테스트 환경)
- **Pro Plan:** $20/월 + 사용량 기반 (프로덕션 환경 권장)
- **PostgreSQL:** 포함 (스토리지 사용량에 따라 추가 비용 발생 가능)
- **참고:** Frontend와 Backend를 별도 서비스로 배포할 경우, 각 서비스별로 비용이 발생합니다.

### 11.2. 비용 최적화
- 미사용 환경은 즉시 삭제
- 개발 환경은 필요 시에만 활성화
- 로그 보관 기간 적절히 설정

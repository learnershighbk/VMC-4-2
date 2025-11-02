# Backend README

Django REST Framework 백엔드 프로젝트입니다.

## 시작하기

### 가상환경 설정

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 패키지 설치

```bash
pip install -r requirements.txt
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=project_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 데이터베이스 마이그레이션

```bash
python manage.py migrate
```

### 슈퍼유저 생성

```bash
python manage.py createsuperuser
```

### 개발 서버 실행

```bash
python manage.py runserver
```

서버는 `http://localhost:8000`에서 실행됩니다.

## 테스트

### Django TestCase 사용

```bash
python manage.py test
```

### pytest 사용 (권장)

```bash
pytest

# 커버리지 리포트
pytest --cov=. --cov-report=html
```

### 테스트 위치

- `apps/authentication/tests.py` - 인증 API 테스트
- `apps/data_upload/tests.py` - 데이터 업로드 API 테스트
- `apps/dashboard/tests.py` - 대시보드 API 테스트

## API 엔드포인트

- `POST /api/auth/token/` - JWT 토큰 발급
- `POST /api/auth/token/refresh/` - 토큰 갱신
- `POST /api/data/upload/` - CSV 파일 업로드
- `GET /api/dashboard/overview/` - 대시보드 개요
- `GET /api/dashboard/performance/` - 실적 데이터
- `GET /api/dashboard/metrics/` - 지표 데이터

## 프로젝트 구조

```
backend/
├── config/              # Django 설정
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── authentication/  # 인증 앱
│   ├── data_upload/     # 데이터 업로드 앱
│   └── dashboard/       # 대시보드 앱
├── manage.py
├── requirements.txt
├── pytest.ini
└── conftest.py
```

# 기술 명세서 (Technical Specification)

## 1. 개요 (Overview)
- 이 문서는 [docs/prd.md의 제품 목표] 달성을 위한 기술 스택, 아키텍처, 그리고 주요 기술적 결정 사항을 정의합니다.

## 2. 기술 스택 (Technology Stack)
> 각 영역별로 사용할 핵심 기술과 라이브러리를 명시하고, 선택 이유를 간결하게 기술합니다.

### 2.1. 프론트엔드 (Frontend)
- **Framework:** Next.js (SuperNext Template)
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Data Visualization:** Recharts
- **선택 이유:**
  - **SuperNext:** 생산성 높은 개발 환경과 필수 기능(인증, UI 컴포넌트 등)이 사전 통합되어 있어 MVP 개발 속도를 극대화합니다.
  - **TypeScript:** 정적 타입을 통해 코드의 안정성과 유지보수성을 확보합니다.
  - **Zustand:** 가볍고 직관적인 API를 가진 상태 관리 라이브러리로, 최소한의 보일러플레이트로 상태 관리가 가능합니다.
  - **Recharts:** React 기반의 선언적인 차트 라이브러리로, 요구사항에 맞는 다양한 차트를 쉽게 구현할 수 있습니다.

### 2.2. 백엔드 (Backend)
- **Framework:** Django REST Framework
- **Language:** Python 3.11+
- **CSV Parsing:** Pandas
- **Validation:** Django REST Framework Serializers
- **ORM:** Django ORM
- **선택 이유:**
  - **Django REST Framework:** 강력한 인증 시스템과 ORM을 기반으로 안정적이고 보안이 검증된 API를 신속하게 개발할 수 있습니다. Serializer를 통한 자동 검증과 직렬화를 제공합니다.
  - **Python & Pandas:** 데이터 처리 및 분석에 압도적인 생태계를 가지고 있어, 복잡한 CSV 데이터 파싱 및 정제 요구사항에 효과적으로 대응할 수 있습니다.
  - **Django ORM:** 데이터베이스 쿼리를 추상화하여 SQL 직접 작성 없이도 안전하고 효율적인 데이터 접근이 가능합니다.

### 2.3. 데이터베이스 (Database)
- **Type:** PostgreSQL
- **선택 이유:**
  - Django와의 호환성이 뛰어나고, 안정성과 데이터 무결성이 검증된 오픈소스 RDBMS입니다. Railway에서 기본적으로 지원하여 관리가 용이하며, Django ORM을 통해 간편하게 접근할 수 있습니다.

### 2.4. 인프라 및 배포 (Infrastructure & Deployment)
- **Platform:** Railway.app
- **CI/CD:** GitHub Actions (Railway 연동)
- **선택 이유:**
  - GitHub 레포지토리 연결을 통해 소스 코드 Push만으로 자동 빌드 및 배포가 이루어져 인프라 관리 부담을 최소화합니다. DB 등 필요한 서비스를 함께 프로비저닝할 수 있어 MVP에 최적화되어 있습니다.

## 3. 고수준 아키텍처 (High-level Architecture)
> 시스템의 전체 구성 요소와 상호작용을 다이어그램으로 표현합니다.

```mermaid
graph TD
    A[User] -- HTTPS --> B(Browser: SuperNext);
    B -- API Request --> C(Backend: Django REST Framework on Railway);
    C -- CRUD --> D(Database: PostgreSQL on Railway);
    C -- Parse --> E[Uploaded CSV File];
    B -- Render Chart --> A;
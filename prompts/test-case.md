# 테스트 케이스 명세서 (Test Case Specification)

> 이 문서는 `docs/usecases.md`에 정의된 모든 시나리오를 검증하기 위한 구체적인 테스트 케이스를 BDD(Behavior-Driven Development) 스타일의 **Given-When-Then** 형식으로 기술합니다.

---

## UC-01: 사용자 로그인

### TC-01-01: 성공적인 로그인
- **Test Type:** E2E (End-to-End)
- **Scenario:** `UC-01`의 Main Success Scenario
- **Given:** 유효한 관리자 계정(`testadmin`/`password123`)이 데이터베이스에 존재하고, 사용자는 로그인 페이지에 있다.
- **When:** 사용자가 아이디 입력란에 `testadmin`을, 비밀번호 입력란에 `password123`을 입력한 후 '로그인' 버튼을 클릭한다.
- **Then:** 사용자는 `/dashboard` 경로로 리디렉션되어야 한다.

### TC-01-02: 잘못된 비밀번호로 로그인 실패
- **Test Type:** E2E (End-to-End)
- **Scenario:** `UC-01`의 Extensions (3a)
- **Given:** 유효한 관리자 계정(`testadmin`/`password123`)이 존재하고, 사용자는 로그인 페이지에 있다.
- **When:** 사용자가 아이디 입력란에 `testadmin`을, 비밀번호 입력란에 `wrongpassword`를 입력한 후 '로그인' 버튼을 클릭한다.
- **Then:** 페이지 URL은 변경되지 않아야 하며, "아이디 또는 비밀번호가 일치하지 않습니다." 라는 오류 메시지가 화면에 표시되어야 한다.

---

## UC-02: 엑셀 데이터 업로드

### TC-02-01: 성공적인 엑셀 파일 업로드
- **Test Type:** Integration (Backend)
- **Scenario:** `UC-02`의 Main Success Scenario
- **Given:** 인증된 관리자 사용자가 있고, 모든 데이터가 유효한 샘플 `test_data.xlsx` 파일이 준비되어 있다.
- **When:** `/api/data/upload` 엔드포인트로 `test_data.xlsx` 파일을 포함한 `POST` 요청을 보낸다.
- **Then:** API는 `201 Created` 상태 코드와 함께 성공 메시지를 응답해야 하며, `monthly_metrics` 테이블에는 엑셀 파일의 내용과 일치하는 데이터가 저장되어 있어야 한다.

### TC-02-02: 잘못된 파일 형식 업로드 시도
- **Test Type:** E2E (End-to-End)
- **Scenario:** `UC-02`의 Extensions (2a)
- **Given:** 인증된 관리자 사용자가 데이터 업로드 페이지에 있다.
- **When:** 사용자가 `test_data.csv` 파일을 업로드하려고 시도한다.
- **Then:** "지원하지 않는 파일 형식입니다. (.xlsx 파일만 가능)" 이라는 오류 메시지가 화면에 표시되어야 하며, API 요청은 발생하지 않아야 한다.

### TC-02-03: 데이터 유효성 검증 실패
- **Test Type:** Integration (Backend)
- **Scenario:** `UC-02`의 Extensions (3a)
- **Given:** 인증된 관리자 사용자가 있고, `performance` 컬럼에 문자열이 포함된 `invalid_data.xlsx` 파일이 준비되어 있다.
- **When:** `/api/data/upload` 엔드포인트로 `invalid_data.xlsx` 파일을 포함한 `POST` 요청을 보낸다.
- **Then:** API는 `400 Bad Request` 상태 코드와 함께 데이터 유효성 검증 실패에 대한 오류 메시지를 응답해야 하며, `monthly_metrics` 테이블의 데이터 수는 요청 전과 동일해야 한다.


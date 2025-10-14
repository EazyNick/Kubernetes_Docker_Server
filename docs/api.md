# 🔧 API 문서 (API Documentation)

이 문서는 Kubernetes Docker 모니터링 서버의 API 엔드포인트와 사용 방법을 설명합니다.

## 📋 API 개요

### 기본 정보

- **Base URL**: `http://localhost:8000`
- **API 버전**: v1
- **인증 방식**: 세션 기반 인증 (Session Token)
- **응답 형식**: JSON

### 인증 헤더

```http
Authorization: Bearer <SESSION_TOKEN>
```

## 🔐 인증 API (`/api/auth/`)

### 로그인

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "access_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "token_type": "bearer",
    "user": {
      "user_id": "1",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  },
  "message": "로그인 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 로그아웃

```http
POST /api/auth/logout
Authorization: Bearer <SESSION_TOKEN>
```

**응답 예시:**

```json
{
  "success": true,
  "data": null,
  "message": "로그아웃 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 회원가입

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "user_id": "2",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user"
  },
  "message": "회원가입 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 사용자 정보 조회

```http
GET /api/auth/user-info
Authorization: Bearer <SESSION_TOKEN>
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "user_id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2025-01-01T00:00:00Z",
    "last_login": "2025-01-02T12:00:00Z"
  },
  "message": "사용자 정보 조회 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 사용자 상태 업데이트

```http
POST /api/auth/update-status
Authorization: Bearer <SESSION_TOKEN>
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "last_login": "2025-01-02T12:00:00Z"
  },
  "message": "사용자 상태 업데이트 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

## 👨‍💼 관리자 API (`/api/admin/`)

> **주의**: 관리자 권한이 필요한 API입니다.

### 관리자 통계 조회

```http
GET /api/admin/stats
Authorization: Bearer <ADMIN_SESSION_TOKEN>
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "total_users": 10,
    "active_users": 8,
    "admin_users": 2,
    "recent_logins": 5,
    "new_users_today": 1
  },
  "message": "관리자 통계 조회 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 사용자 목록 조회

```http
GET /api/admin/users?page=1&limit=10&search=admin
Authorization: Bearer <ADMIN_SESSION_TOKEN>
```

**쿼리 파라미터:**

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `search`: 검색 키워드 (선택사항)

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": "1",
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "status": "active",
        "created_at": "2025-01-01T00:00:00Z",
        "last_login": "2025-01-02T12:00:00Z",
        "total_logins": 15,
        "successful_logins": 14,
        "failed_logins": 1
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "items_per_page": 10
    }
  },
  "message": "사용자 목록 조회 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 사용자 생성

```http
POST /api/admin/users
Authorization: Bearer <ADMIN_SESSION_TOKEN>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",
  "is_active": true
}
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "user_id": "2",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user",
    "status": "active",
    "created_at": "2025-01-02T12:00:00Z"
  },
  "message": "사용자 생성 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 사용자 정보 수정

```http
PUT /api/admin/users/{user_id}
Authorization: Bearer <ADMIN_SESSION_TOKEN>
Content-Type: application/json

{
  "username": "updateduser",
  "email": "updated@example.com",
  "role": "admin",
  "is_active": true
}
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "user_id": "2",
    "username": "updateduser",
    "email": "updated@example.com",
    "role": "admin",
    "status": "active",
    "updated_at": "2025-01-02T12:00:00Z"
  },
  "message": "사용자 정보 수정 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 사용자 삭제

```http
DELETE /api/admin/users/{user_id}
Authorization: Bearer <ADMIN_SESSION_TOKEN>
```

**응답 예시:**

```json
{
  "success": true,
  "data": null,
  "message": "사용자 삭제 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 단일 사용자 조회

```http
GET /api/admin/users/{user_id}
Authorization: Bearer <ADMIN_SESSION_TOKEN>
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "user_id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-02T12:00:00Z",
    "last_login": "2025-01-02T12:00:00Z",
    "total_logins": 15,
    "successful_logins": 14,
    "failed_logins": 1,
    "last_login_attempt": "2025-01-02T12:00:00Z",
    "recent_login_flag": 1
  },
  "message": "사용자 정보 조회 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

## 📊 통계 API (`/api/stats/`)

### 시스템 개요 통계

```http
GET /api/stats/overview
Authorization: Bearer <SESSION_TOKEN>
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "system_status": "healthy",
    "total_containers": 25,
    "running_containers": 20,
    "stopped_containers": 5,
    "total_pods": 15,
    "running_pods": 12,
    "pending_pods": 3,
    "cpu_usage": 65.5,
    "memory_usage": 78.2,
    "disk_usage": 45.8
  },
  "message": "시스템 개요 통계 조회 성공",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

## 📝 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": null
}
```

### 오류 응답

```json
{
  "success": false,
  "data": null,
  "message": "오류 메시지",
  "timestamp": "2025-01-02T12:00:00Z",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "상세 오류 정보"
  }
}
```

## 🔒 인증 및 권한

### 세션 토큰 구조

세션 토큰은 64자리 16진수 문자열로 구성됩니다:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 세션 관리

- **토큰 생성**: 로그인 시 `secrets.token_hex(32)`로 생성
- **만료 시간**: 기본 4시간, "기억하기" 선택 시 7일
- **저장 위치**: `sessions` 테이블에 토큰과 만료시간 저장
- **자동 삭제**: 만료된 세션은 자동으로 데이터베이스에서 삭제

### 권한 레벨

- **admin**: 모든 API 접근 가능
- **user**: 일반 사용자 API만 접근 가능
- **guest**: 제한된 API 접근

### 토큰 갱신

세션 토큰은 만료 시간이 있으며, 만료 시 재로그인이 필요합니다.

## 🐛 오류 코드

| 코드                      | 설명                  | 해결 방법             |
| ------------------------- | --------------------- | --------------------- |
| `VALIDATION_ERROR`        | 입력 데이터 검증 실패 | 요청 데이터 형식 확인 |
| `AUTHENTICATION_ERROR`    | 인증 실패             | 로그인 상태 확인      |
| `AUTHORIZATION_ERROR`     | 권한 부족             | 관리자 권한 확인      |
| `USER_NOT_FOUND`          | 사용자 없음           | 사용자 ID 확인        |
| `EMAIL_ALREADY_EXISTS`    | 이메일 중복           | 다른 이메일 사용      |
| `USERNAME_ALREADY_EXISTS` | 사용자명 중복         | 다른 사용자명 사용    |
| `DATABASE_ERROR`          | 데이터베이스 오류     | 서버 관리자 문의      |

## 📚 추가 리소스

### API 테스트 도구

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### 예제 코드

```javascript
// JavaScript 예제
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@example.com",
    password: "password123",
  }),
});

const data = await response.json();
console.log(data);
```

```python
# Python 예제
import requests

response = requests.post('http://localhost:8000/api/auth/login', json={
    'email': 'admin@example.com',
    'password': 'password123'
})

data = response.json()
print(data)
```

---

**📌 참고**: 이 API 문서는 현재 구현된 기능을 기준으로 작성되었습니다. 향후 기능 확장에 따라 업데이트될 예정입니다.

# 🚀 설치 및 실행 가이드 (Installation & Setup Guide)

이 문서는 Kubernetes Docker 모니터링 서버 프로젝트의 설치 및 실행 방법을 단계별로 설명합니다.

## 📋 사전 요구사항 (Prerequisites)

### 필수 소프트웨어

- **Python 3.9+** - 메인 프로그래밍 언어
- **MySQL 8.0+** - 관계형 데이터베이스
- **Git** - 버전 관리 시스템

### 선택적 소프트웨어

- **Docker & Docker Compose** - 컨테이너화 환경
- **VS Code** - 권장 개발 환경(IDE)

### 시스템 요구사항

- **운영체제**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **메모리**: 최소 4GB RAM (권장 8GB+)
- **디스크**: 최소 2GB 여유 공간
- **네트워크**: 인터넷 연결 (패키지 다운로드용)

## 🔧 설치 과정

### 1단계: 프로젝트 클론

```bash
# GitHub에서 프로젝트 클론
git clone https://github.com/your-username/Kubernetes_Docker_Server.git

# 프로젝트 디렉토리로 이동
cd Kubernetes_Docker_Server
```

### 2단계: 가상환경 설정

#### Windows

```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화
venv\Scripts\activate

# 가상환경 활성화 확인 (프롬프트에 (venv) 표시됨)
```

#### Linux/macOS

```bash
# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화
source venv/bin/activate

# 가상환경 활성화 확인 (프롬프트에 (venv) 표시됨)
```

### 3단계: 의존성 설치

```bash
# pip 업그레이드 (권장)
pip install --upgrade pip

# 프로젝트 의존성 설치
pip install -r requirements.txt
```

#### 설치되는 주요 패키지

- **FastAPI** - 웹 프레임워크
- **SQLAlchemy** - ORM
- **PyMySQL** - MySQL 드라이버
- **Pydantic** - 데이터 검증
- **argon2-cffi** - 비밀번호 해싱
- **python-multipart** - 파일 업로드

### 4단계: 환경 변수 설정

#### `.env` 파일 생성 (선택사항)

```bash
# 프로젝트 루트에 .env 파일 생성
touch .env
```

#### `.env` 파일 내용

````env
# 데이터베이스 설정
DATABASE_URL=mysql://username:password@localhost:3306/kubernetis_docker_server_db

# 세션 시크릿 키
SECRET_KEY=your-super-secret-key-here-change-in-production

# 환경 설정
ENVIRONMENT=development
DEBUG=True

## 🚀 서버 실행

### 개발 서버 실행

```bash
# 가상환경이 활성화된 상태에서 실행
python -m uvicorn main:app --reload --port 8000
````

#### 실행 옵션 설명

- `--reload`: 코드 변경 시 자동 재시작 (개발용)
- `--port 8000`: 포트 8000에서 실행
- `--host 0.0.0.0`: 모든 IP에서 접근 허용 (선택사항)

### 프로덕션 서버 실행

```bash
# 프로덕션 환경에서는 reload 옵션 제거
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker로 실행 (선택사항)

#### Dockerfile 생성

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose 실행

```bash
# docker-compose.yml 파일 생성 후
docker-compose up -d
```

## 🌐 웹 인터페이스 접속

### 기본 접속 정보

- **웹 인터페이스**: `http://localhost:8000`
- **API 문서**: `http://localhost:8000/docs`
- **관리자 페이지**: `http://localhost:8000/admin`

## 🔧 설정 및 커스터마이징

### 포트 변경

```bash
# 다른 포트로 실행
python -m uvicorn main:app --reload --port 8080
```

### 호스트 변경

```bash
# 특정 IP에서만 접근 허용
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 로그 레벨 설정

```bash
# 디버그 로그 활성화
python -m uvicorn main:app --reload --log-level debug
```

## 📊 성능 최적화

### 개발 환경 최적화

- **`--reload`** 옵션 사용으로 개발 효율성 향상
- **디버그 모드** 활성화로 상세한 오류 정보 확인

### 프로덕션 환경 최적화

- **Gunicorn** 사용 고려
- **Nginx** 리버스 프록시 설정
- **Redis** 캐시 활용
- **데이터베이스 연결 풀** 설정

## 🔒 보안 설정

### 프로덕션 환경 보안 체크리스트

- [ ] 기본 비밀번호 변경
- [ ] SECRET_KEY 변경
- [ ] HTTPS 설정
- [ ] 방화벽 설정
- [ ] 데이터베이스 접근 제한
- [ ] 로그 파일 권한 설정

---

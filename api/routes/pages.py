"""
HTML 페이지 라우트
웹 페이지 렌더링을 담당하는 라우트들
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.templating import Jinja2Templates
from sqlalchemy import text
from sqlalchemy.orm import Session
from db.database import get_db
from datetime import datetime
import os
import sys

current_file = os.path.abspath(__file__) 
project_root = os.path.abspath(os.path.join(current_file, "..", ".."))
sys.path.append(project_root)

try:
    from logs import log_manager
except Exception as e:
    print(f"임포트 실패: {e}")
    # log_manager가 없을 때를 위한 더미 클래스
    class DummyLogManager:
        class Logger:
            def info(self, msg): print(f"INFO: {msg}")
            def error(self, msg): print(f"ERROR: {msg}")
            def warning(self, msg): print(f"WARNING: {msg}")
        logger = Logger()
    log_manager = DummyLogManager()

# 템플릿 엔진 설정
templates = Jinja2Templates(directory="templates")

# 라우터 생성
router = APIRouter()

# 보안 스키마
security = HTTPBearer()

async def verify_admin_access_with_token(token: str, db: Session = Depends(get_db)):
    """토큰으로 관리자 권한 확인"""
    try:
        log_manager.logger.info("토큰으로 관리자 권한 확인 시작")
        log_manager.logger.info(f"토큰: {token[:10]}...")
        
        # 1. 세션 테이블에서 토큰 조회
        session = db.execute(text(
            """
            SELECT user_id, expires_at
            FROM sessions
            WHERE session_token = :token
            ORDER BY id DESC
            LIMIT 1
            """), {'token': token}).first()

        if not session:
            log_manager.logger.warning("유효하지 않은 세션 토큰")
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

        log_manager.logger.info(f"세션 발견: user_id={session.user_id}, expires_at={session.expires_at}")

        # 2. 세션 만료 여부 확인
        if datetime.utcnow() > session.expires_at:
            log_manager.logger.warning("세션 만료됨")
            db.execute(text(
                """
                DELETE FROM sessions WHERE session_token = :token
                """), {'token': token})
            db.commit()
            raise HTTPException(status_code=401, detail="세션이 만료되었습니다. 다시 로그인해주세요.")

        # 3. 사용자 정보 및 role 조회
        user = db.execute(text(
            """
            SELECT id, username, email, role
            FROM users
            WHERE id = :user_id
            """), {'user_id': session.user_id}).first()

        if not user:
            log_manager.logger.warning(f"사용자를 찾을 수 없음: user_id={session.user_id}")
            raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다.")
        
        log_manager.logger.info(f"사용자 정보: id={user.id}, username={user.username}, role={user.role}")
        
        # 4. 관리자 권한 확인
        if user.role != "admin":
            log_manager.logger.warning(f"관리자 권한 없음: role={user.role}")
            raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다.")
        
        log_manager.logger.info("관리자 권한 확인 완료")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"관리자 권한 확인 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="권한 확인 중 오류가 발생했습니다.")

async def verify_admin_access(request: Request, db: Session = Depends(get_db)):
    """관리자 권한 확인"""
    try:
        log_manager.logger.info("관리자 권한 확인 시작")
        
        # Authorization 헤더에서 토큰 추출
        auth_header = request.headers.get("authorization")
        log_manager.logger.info(f"Authorization 헤더: {auth_header}")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            log_manager.logger.warning("인증 토큰이 없거나 형식이 잘못됨")
            raise HTTPException(status_code=401, detail="인증 토큰이 필요합니다.")
        
        token = auth_header.split(" ")[1]
        log_manager.logger.info(f"토큰 추출 완료: {token[:10]}...")
        
        # 1. 세션 테이블에서 토큰 조회
        session = db.execute(text(
            """
            SELECT user_id, expires_at
            FROM sessions
            WHERE session_token = :token
            ORDER BY id DESC
            LIMIT 1
            """), {'token': token}).first()

        if not session:
            log_manager.logger.warning("유효하지 않은 세션 토큰")
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

        log_manager.logger.info(f"세션 발견: user_id={session.user_id}, expires_at={session.expires_at}")

        # 2. 세션 만료 여부 확인
        if datetime.utcnow() > session.expires_at:
            log_manager.logger.warning("세션 만료됨")
            # 만료된 세션은 DB에서 삭제
            db.execute(text(
                """
                DELETE FROM sessions WHERE session_token = :token
                """), {'token': token})
            db.commit()
            raise HTTPException(status_code=401, detail="세션이 만료되었습니다. 다시 로그인해주세요.")

        # 3. 사용자 정보 및 role 조회
        user = db.execute(text(
            """
            SELECT id, username, email, role
            FROM users
            WHERE id = :user_id
            """), {'user_id': session.user_id}).first()

        if not user:
            log_manager.logger.warning(f"사용자를 찾을 수 없음: user_id={session.user_id}")
            raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다.")
        
        log_manager.logger.info(f"사용자 정보: id={user.id}, username={user.username}, role={user.role}")
        
        # 4. 관리자 권한 확인
        if user.role != "admin":
            log_manager.logger.warning(f"관리자 권한 없음: role={user.role}")
            raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다.")
        
        log_manager.logger.info("관리자 권한 확인 완료")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"관리자 권한 확인 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="권한 확인 중 오류가 발생했습니다.")

@router.get("/")
def login_page(request: Request):
    """로그인 페이지"""
    try:
        log_manager.logger.info("로그인 페이지 접근 요청")
        response = templates.TemplateResponse("index.html", {"request": request})
        log_manager.logger.info("로그인 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"로그인 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/home")
def home_page(request: Request):
    """홈 페이지"""
    try:
        log_manager.logger.info(f"🏠 홈 페이지 접근 요청 - IP: {request.client.host if request.client else 'Unknown'}")
        log_manager.logger.info(f"🏠 홈 페이지 접근 요청 - User-Agent: {request.headers.get('user-agent', 'Unknown')}")
        response = templates.TemplateResponse("home.html", {"request": request})
        log_manager.logger.info("🏠 홈 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"🏠 홈 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/dashboard")
def dashboard(request: Request):
    """대시보드 페이지"""
    try:
        log_manager.logger.info("대시보드 페이지 접근 요청")
        response = templates.TemplateResponse("dashboard.html", {"request": request})
        log_manager.logger.info("대시보드 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"대시보드 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/containers")
def containers(request: Request):
    """컨테이너 관리 페이지"""
    try:
        log_manager.logger.info("컨테이너 관리 페이지 접근 요청")
        response = templates.TemplateResponse("containers.html", {"request": request})
        log_manager.logger.info("컨테이너 관리 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"컨테이너 관리 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/nodes")
def nodes(request: Request):
    """노드 관리 페이지"""
    try:
        log_manager.logger.info("노드 관리 페이지 접근 요청")
        response = templates.TemplateResponse("nodes.html", {"request": request})
        log_manager.logger.info("노드 관리 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"노드 관리 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/monitoring")
def monitoring(request: Request):
    """모니터링 페이지"""
    try:
        log_manager.logger.info("모니터링 페이지 접근 요청")
        response = templates.TemplateResponse("monitoring.html", {"request": request})
        log_manager.logger.info("모니터링 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"모니터링 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/logs")
def logs(request: Request):
    """로그 페이지"""
    try:
        log_manager.logger.info("로그 페이지 접근 요청")
        response = templates.TemplateResponse("logs.html", {"request": request})
        log_manager.logger.info("로그 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"로그 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/alerts")
def alerts(request: Request):
    """알림 페이지"""
    try:
        log_manager.logger.info("알림 페이지 접근 요청")
        response = templates.TemplateResponse("alerts.html", {"request": request})
        log_manager.logger.info("알림 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"알림 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/events")
def events(request: Request):
    """이벤트 페이지"""
    try:
        log_manager.logger.info("이벤트 페이지 접근 요청")
        response = templates.TemplateResponse("events.html", {"request": request})
        log_manager.logger.info("이벤트 페이지 응답 완료")
        return response
    except Exception as e:
        log_manager.logger.error(f"이벤트 페이지 처리 중 오류 발생: {e}")
        raise

@router.get("/admin")
async def admin(request: Request, db: Session = Depends(get_db)):
    """관리자 페이지 - 관리자 권한 필요"""
    try:
        log_manager.logger.info("관리자 페이지 접근 요청")
        
        # 쿼리 파라미터에서 토큰 확인
        token = request.query_params.get("token")
        
        if token:
            # 쿼리 파라미터의 토큰으로 직접 권한 확인
            current_user = await verify_admin_access_with_token(token, db)
        else:
            # 기존 방식으로 권한 확인
            current_user = await verify_admin_access(request, db)
        log_manager.logger.info(f"관리자 페이지 접근 허용: {current_user.username}")
        
        response = templates.TemplateResponse("admin.html", {
            "request": request,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email,
                "role": current_user.role
            }
        })
        log_manager.logger.info("관리자 페이지 응답 완료")
        return response
        
    except HTTPException as e:
        log_manager.logger.warning(f"관리자 페이지 접근 거부: {e.detail}")
        # 권한이 없는 경우 접근 거부 페이지로 리다이렉트
        return templates.TemplateResponse("access_denied.html", {
            "request": request,
            "error_message": e.detail,
            "error_code": e.status_code
        })
    except Exception as e:
        log_manager.logger.error(f"관리자 페이지 처리 중 오류 발생: {e}")
        raise
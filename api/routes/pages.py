"""
HTML 페이지 라우트
웹 페이지 렌더링을 담당하는 라우트들
"""
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
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

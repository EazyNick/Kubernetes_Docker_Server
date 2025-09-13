"""
HTML 페이지 라우트
웹 페이지 렌더링을 담당하는 라우트들
"""
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

# 템플릿 엔진 설정
templates = Jinja2Templates(directory="templates")

# 라우터 생성
router = APIRouter()

@router.get("/")
def read_root(request: Request):
    """홈 페이지"""
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/dashboard")
def dashboard(request: Request):
    """대시보드 페이지"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@router.get("/containers")
def containers(request: Request):
    """컨테이너 관리 페이지"""
    return templates.TemplateResponse("containers.html", {"request": request})

@router.get("/nodes")
def nodes(request: Request):
    """노드 관리 페이지"""
    return templates.TemplateResponse("nodes.html", {"request": request})

@router.get("/monitoring")
def monitoring(request: Request):
    """모니터링 페이지"""
    return templates.TemplateResponse("monitoring.html", {"request": request})

@router.get("/logs")
def logs(request: Request):
    """로그 페이지"""
    return templates.TemplateResponse("logs.html", {"request": request})

@router.get("/alerts")
def alerts(request: Request):
    """알림 페이지"""
    return templates.TemplateResponse("alerts.html", {"request": request})

@router.get("/events")
def events(request: Request):
    """이벤트 페이지"""
    return templates.TemplateResponse("events.html", {"request": request})

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# DB 테이블 생성을 위한 임포트
from db.database import engine, Base
from models import alert # alert.py의 모델들을 로드하기 위해 임포트

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# API 라우터들 import
from api.routes import pages, stats, containers, nodes, alerts, events, logs, monitoring, auth, admin

# uvicorn main:app --reload --port 8000

app = FastAPI(
    title="Kubernetes Docker Server",
    description="Kubernetes 및 Docker 컨테이너 모니터링 시스템",
    version="1.0.0"
)

# Static 파일 서빙 설정
app.mount("/static", StaticFiles(directory="static"), name="static")

# 파비콘 설정
@app.get("/favicon.ico")
async def favicon():
    return FileResponse("static/img/favicon.png")

# HTML 페이지 라우터 등록
app.include_router(pages.router)

# API 라우터들 등록
app.include_router(auth.router)       # /api/auth/*
app.include_router(stats.router)      # /api/stats/*
app.include_router(containers.router) # /api/containers/*
app.include_router(nodes.router)      # /api/nodes/*
app.include_router(alerts.router)     # /api/alerts/*
app.include_router(events.router)     # /api/events/*
app.include_router(logs.router)       # /api/logs/*
app.include_router(monitoring.router) # /api/monitoring/*
app.include_router(admin.router)      # /api/admin/*


@app.get("/")
async def root():
    """
    루트 경로 - 홈 페이지로 리디렉션 또는 기본 페이지 제공
    """
    return FileResponse("templates/home.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
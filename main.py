from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

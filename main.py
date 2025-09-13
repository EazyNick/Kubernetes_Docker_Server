from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# API 라우터들 import
from api.routes import pages, stats, containers, nodes, alerts, events

# uvicorn main:app --reload --port 8001

app = FastAPI(
    title="Kubernetes Docker Server",
    description="Kubernetes 및 Docker 컨테이너 모니터링 시스템",
    version="1.0.0"
)

# Static 파일 서빙 설정
app.mount("/static", StaticFiles(directory="static"), name="static")

# HTML 페이지 라우터 등록
app.include_router(pages.router)

# API 라우터들 등록
app.include_router(stats.router)      # /api/stats/*
app.include_router(containers.router) # /api/containers/*
app.include_router(nodes.router)      # /api/nodes/*
app.include_router(alerts.router)     # /api/alerts/*
app.include_router(events.router)     # /api/events/*

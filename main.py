from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
import os

app = FastAPI()

# Static 파일 서빙 설정
app.mount("/static", StaticFiles(directory="static"), name="static")

# 템플릿 엔진 설정
templates = Jinja2Templates(directory="templates")

@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/dashboard")
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/containers")
def containers(request: Request):
    return templates.TemplateResponse("containers.html", {"request": request})

@app.get("/nodes")
def nodes(request: Request):
    return templates.TemplateResponse("nodes.html", {"request": request})

@app.get("/monitoring")
def monitoring(request: Request):
    return templates.TemplateResponse("monitoring.html", {"request": request})

@app.get("/logs")
def logs(request: Request):
    return templates.TemplateResponse("logs.html", {"request": request})

@app.get("/alerts")
def alerts(request: Request):
    return templates.TemplateResponse("alerts.html", {"request": request})

@app.get("/events")
def events(request: Request):
    return templates.TemplateResponse("events.html", {"request": request})
0

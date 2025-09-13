"""
컨테이너 관련 데이터 모델
"""
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class Container(BaseModel):
    """개별 컨테이너 정보"""
    id: str
    name: str
    image: str
    status: str  # "running", "stopped", "failed"
    cpu: float  # CPU 사용률 (%)
    memory: int  # 메모리 사용량 (MB)
    uptime: str  # 가동 시간 (예: "5d 12h")
    node: str  # 실행 중인 노드
    created_at: str  # 생성 시간 (ISO 8601)
    restart_count: int  # 재시작 횟수

    class Config:
        json_schema_extra = {
            "example": {
                "id": "container-001",
                "name": "app-web-01",
                "image": "nginx:latest",
                "status": "running",
                "cpu": 25.5,
                "memory": 512,
                "uptime": "5d 12h",
                "node": "k8s-node-1",
                "created_at": "2024-01-10T08:30:00Z",
                "restart_count": 0
            }
        }


class Pagination(BaseModel):
    """페이징 정보"""
    page: int
    per_page: int
    total: int
    total_pages: int


class ContainerList(BaseModel):
    """컨테이너 목록과 페이징 정보"""
    containers: List[Container]
    pagination: Pagination

    class Config:
        json_schema_extra = {
            "example": {
                "containers": [
                    {
                        "id": "container-001",
                        "name": "app-web-01",
                        "image": "nginx:latest",
                        "status": "running",
                        "cpu": 25.5,
                        "memory": 512,
                        "uptime": "5d 12h",
                        "node": "k8s-node-1",
                        "created_at": "2024-01-10T08:30:00Z",
                        "restart_count": 0
                    }
                ],
                "pagination": {
                    "page": 1,
                    "per_page": 20,
                    "total": 147,
                    "total_pages": 8
                }
            }
        }

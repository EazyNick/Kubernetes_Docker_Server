"""
컨테이너 관련 데이터 모델
"""
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class NetworkInfo(BaseModel):
    """네트워크 정보"""
    rx: int  # 수신 속도 (Bytes/s)
    tx: int  # 송신 속도 (Bytes/s)


class MemoryInfo(BaseModel):
    """메모리 정보"""
    used: int  # 사용량 (MB)
    total: int  # 총량 (MB)
    usage: float  # 사용률 (%)


class Container(BaseModel):
    """개별 컨테이너 정보"""
    id: str
    name: str
    image: str
    status: str  # "running", "stopped", "failed"
    cpu: float  # CPU 사용률 (%)
    memory: MemoryInfo  # 메모리 정보
    network: Optional[NetworkInfo] = None  # 네트워크 정보
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
                "memory": {
                    "used": 512,
                    "total": 1024,
                    "usage": 50.0
                },
                "network": {
                    "rx": 1200000,
                    "tx": 800000
                },
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
                        "memory": {
                            "used": 512,
                            "total": 1024,
                            "usage": 50.0
                        },
                        "network": {
                            "rx": 1200000,
                            "tx": 800000
                        },
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

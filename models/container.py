"""
컨테이너 관련 데이터 모델
"""
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class NetworkInfo(BaseModel):
    """컨테이너 네트워크 트래픽 정보 모델"""
    rx: int  # 수신 속도 (Bytes/s, 예: 1200000 = 1.2MB/s)
    tx: int  # 송신 속도 (Bytes/s, 예: 800000 = 0.8MB/s)


class MemoryInfo(BaseModel):
    """컨테이너 메모리 사용 정보 모델"""
    used: int  # 현재 사용 중인 메모리 양 (MB 단위, 예: 512)
    total: int  # 컨테이너에 할당된 총 메모리 양 (MB 단위, 예: 1024)
    usage: float  # 메모리 사용률 (백분율, 예: 50.0 = 50%)


class Container(BaseModel):
    """개별 컨테이너 정보 모델"""
    id: str  # 컨테이너 고유 식별자 (예: "container-001", "abc123def456")
    name: str  # 컨테이너 이름 (예: "app-web-01", "nginx-pod-abc123")
    image: str  # 컨테이너 이미지 (예: "nginx:latest", "redis:7.0", "postgres:15")
    status: str  # 컨테이너 상태 ("running"=실행중, "stopped"=중지됨, "failed"=실패, "paused"=일시정지)
    cpu: float  # CPU 사용률 (백분율, 예: 25.5 = 25.5%)
    memory: MemoryInfo  # 메모리 사용 정보 (MemoryInfo 객체)
    network: Optional[NetworkInfo] = None  # 네트워크 트래픽 정보 (선택사항, NetworkInfo 객체)
    uptime: str  # 가동 시간 (사용자 친화적 형식, 예: "5d 12h", "2h 30m", "30s")
    node: str  # 실행 중인 노드 이름 (예: "k8s-node-1", "worker-02", "master-01")
    created_at: str  # 컨테이너 생성 시간 (ISO 8601 형식, 예: "2024-01-10T08:30:00Z")
    restart_count: int  # 재시작 횟수 (예: 0, 3, 15)

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
    """페이징 정보 모델"""
    page: int  # 현재 페이지 번호 (1부터 시작, 예: 1, 2, 3)
    per_page: int  # 페이지당 항목 수 (예: 20, 50, 100)
    total: int  # 전체 항목 수 (예: 147)
    total_pages: int  # 전체 페이지 수 (예: 8, 계산값: ceil(total / per_page))


class ContainerList(BaseModel):
    """컨테이너 목록과 페이징 정보를 포함한 응답 모델"""
    containers: List[Container]  # 컨테이너 객체들의 배열 (현재 페이지의 컨테이너들)
    pagination: Pagination  # 페이징 정보 (페이지네이션 UI 표시용)

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

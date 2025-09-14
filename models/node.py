"""
노드 관련 데이터 모델
"""
from typing import List
from pydantic import BaseModel


class ResourceUsage(BaseModel):
    """리소스 사용량 정보"""
    cores: int  # CPU 코어 수
    usage: float  # 사용률 (%)


class MemoryInfo(BaseModel):
    """메모리 정보"""
    total: int  # 총 메모리 (GB)
    usage: float  # 메모리 사용률 (%)


class DiskInfo(BaseModel):
    """디스크 정보"""
    total: int  # 총 디스크 (GB)
    usage: float  # 디스크 사용률 (%)


class Node(BaseModel):
    """개별 노드 정보"""
    name: str
    ip: str
    role: str  # "Master", "Worker", "Docker"
    status: str  # "Ready", "NotReady", "Unknown", "Warning"
    cpu: ResourceUsage
    memory: MemoryInfo
    disk: DiskInfo
    containers: int  # 실행 중인 컨테이너 수
    uptime: str  # 가동 시간
    last_heartbeat: str  # 마지막 하트비트 (ISO 8601)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "k8s-master-01",
                "ip": "10.0.1.10",
                "role": "Master",
                "status": "Ready",
                "cpu": {
                    "cores": 8,
                    "usage": 35.2
                },
                "memory": {
                    "total": 32,
                    "usage": 68.5
                },
                "disk": {
                    "total": 200,
                    "usage": 45.2
                },
                "containers": 25,
                "uptime": "30d 12h",
                "last_heartbeat": "2024-01-15T10:30:00Z"
            }
        }


class NodeList(BaseModel):
    """노드 목록"""
    nodes: List[Node]

    class Config:
        json_schema_extra = {
            "example": {
                "nodes": [
                    {
                        "name": "k8s-master-01",
                        "ip": "10.0.1.10",
                        "role": "Master",
                        "status": "Ready",
                        "cpu": {
                            "cores": 8,
                            "usage": 35.2
                        },
                        "memory": {
                            "total": 32,
                            "usage": 68.5
                        },
                        "disk": {
                            "total": 200,
                            "usage": 45.2
                        },
                        "containers": 25,
                        "uptime": "30d 12h",
                        "last_heartbeat": "2024-01-15T10:30:00Z"
                    }
                ]
            }
        }

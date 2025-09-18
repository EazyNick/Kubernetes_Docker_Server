"""
노드 관련 데이터 모델
"""
from typing import List
from pydantic import BaseModel


class ResourceUsage(BaseModel):
    """리소스 사용량 정보 모델"""
    cores: int  # CPU 코어 수 (예: 4, 8, 16)
    usage: float  # 리소스 사용률 (백분율, 예: 35.2 = 35.2%)


class MemoryInfo(BaseModel):
    """메모리 정보 모델"""
    total: int  # 총 메모리 용량 (GB 단위, 예: 32, 64, 128)
    usage: float  # 메모리 사용률 (백분율, 예: 68.5 = 68.5%)


class DiskInfo(BaseModel):
    """디스크 정보 모델"""
    total: int  # 총 디스크 용량 (GB 단위, 예: 200, 500, 1000)
    usage: float  # 디스크 사용률 (백분율, 예: 45.2 = 45.2%)


class Node(BaseModel):
    """개별 노드 정보 모델"""
    name: str  # 노드 이름 (예: "k8s-master-01", "worker-node-02", "docker-host-01")
    ip: str  # 노드 IP 주소 (예: "10.0.1.10", "192.168.1.100", "172.16.0.5")
    role: str  # 노드 역할 ("Master"=마스터, "Worker"=워커, "Docker"=도커 호스트)
    status: str  # 노드 상태 ("Ready"=준비됨, "NotReady"=준비안됨, "Unknown"=알수없음, "Warning"=경고)
    cpu: ResourceUsage  # CPU 사용량 정보 (ResourceUsage 객체)
    memory: MemoryInfo  # 메모리 사용량 정보 (MemoryInfo 객체)
    disk: DiskInfo  # 디스크 사용량 정보 (DiskInfo 객체)
    containers: int  # 실행 중인 컨테이너 수 (예: 25, 0, 150)
    uptime: str  # 가동 시간 (사용자 친화적 형식, 예: "30d 12h", "2h 30m", "5m")
    last_heartbeat: str  # 마지막 하트비트 시간 (ISO 8601 형식, 예: "2024-01-15T10:30:00Z")

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
    """노드 목록 모델"""
    nodes: List[Node]  # 노드 객체들의 배열 (전체 노드 목록)

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

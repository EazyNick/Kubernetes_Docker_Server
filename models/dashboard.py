"""
대시보드 통계를 위한 데이터 모델
"""
from pydantic import BaseModel


class ContainerStats(BaseModel):
    """컨테이너 통계"""
    total: int
    running: int
    stopped: int
    failed: int


class NodeStats(BaseModel):
    """노드 통계"""
    total: int
    healthy: int
    warning: int


class ResourceStats(BaseModel):
    """리소스 통계"""
    avg_cpu: float  # 평균 CPU 사용률 (%)
    avg_memory: float  # 평균 메모리 사용률 (%)
    network_traffic: int  # 네트워크 트래픽 (MB/s)


class DashboardStats(BaseModel):
    """대시보드 통계"""
    containers: ContainerStats
    nodes: NodeStats
    resources: ResourceStats

    class Config:
        json_schema_extra = {
            "example": {
                "containers": {
                    "total": 147,
                    "running": 134,
                    "stopped": 8,
                    "failed": 5
                },
                "nodes": {
                    "total": 12,
                    "healthy": 11,
                    "warning": 1
                },
                "resources": {
                    "avg_cpu": 35.2,
                    "avg_memory": 68.5,
                    "network_traffic": 150
                }
            }
        }

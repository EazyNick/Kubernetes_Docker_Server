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
    
    # 변화량 필드들
    total_change: str
    running_change: str
    stopped_change: str
    failed_change: str


class NodeStats(BaseModel):
    """노드 통계"""
    total: int
    healthy: int
    warning: int
    
    # 변화량 필드들
    total_change: str
    healthy_change: str
    warning_change: str


class ResourceStats(BaseModel):
    """리소스 통계"""
    avg_cpu: float  # 평균 CPU 사용률 (%)
    avg_memory: float  # 평균 메모리 사용률 (%)
    network_traffic: int  # 네트워크 트래픽 (MB/s)
    
    # 변화량 필드들
    avg_cpu_change: str
    avg_memory_change: str
    network_traffic_change: str


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
                    "failed": 5,
                    "total_change": "+2%",
                    "running_change": "+1%",
                    "stopped_change": "-1%",
                    "failed_change": "+0%"
                },
                "nodes": {
                    "total": 12,
                    "healthy": 11,
                    "warning": 1,
                    "total_change": "+0%",
                    "healthy_change": "+1%",
                    "warning_change": "-1%"
                },
                "resources": {
                    "avg_cpu": 35.2,
                    "avg_memory": 68.5,
                    "network_traffic": 150,
                    "avg_cpu_change": "+2.1%",
                    "avg_memory_change": "+1.3%",
                    "network_traffic_change": "+5%"
                }
            }
        }

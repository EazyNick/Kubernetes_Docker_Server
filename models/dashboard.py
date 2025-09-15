"""
대시보드 통계를 위한 데이터 모델
"""
from pydantic import BaseModel


class ContainerStats(BaseModel):
    """컨테이너 통계 정보 모델"""
    total: int  # 전체 컨테이너 수 (예: 147)
    running: int  # 실행 중인 컨테이너 수 (예: 134)
    stopped: int  # 중지된 컨테이너 수 (예: 8)
    failed: int  # 실패한 컨테이너 수 (예: 5)
    
    # 변화량 필드들 (이전 기간 대비 변화율)
    total_change: str  # 전체 컨테이너 수 변화율 (예: "+2%", "-1%", "+0%")
    running_change: str  # 실행 중인 컨테이너 수 변화율 (예: "+1%", "-2%")
    stopped_change: str  # 중지된 컨테이너 수 변화율 (예: "-1%", "+3%")
    failed_change: str  # 실패한 컨테이너 수 변화율 (예: "+0%", "+1%")


class NodeStats(BaseModel):
    """노드 통계 정보 모델"""
    total: int  # 전체 노드 수 (예: 12)
    healthy: int  # 정상 상태 노드 수 (예: 11)
    warning: int  # 경고 상태 노드 수 (예: 1)
    
    # 변화량 필드들 (이전 기간 대비 변화율)
    total_change: str  # 전체 노드 수 변화율 (예: "+0%", "+1%")
    healthy_change: str  # 정상 노드 수 변화율 (예: "+1%", "-1%")
    warning_change: str  # 경고 노드 수 변화율 (예: "-1%", "+1%")


class ResourceStats(BaseModel):
    """리소스 사용 통계 정보 모델"""
    avg_cpu: float  # 평균 CPU 사용률 (백분율, 예: 35.2 = 35.2%)
    avg_memory: float  # 평균 메모리 사용률 (백분율, 예: 68.5 = 68.5%)
    network_traffic: int  # 네트워크 트래픽 (MB/s 단위, 예: 150 = 150MB/s)
    
    # 변화량 필드들 (이전 기간 대비 변화율)
    avg_cpu_change: str  # 평균 CPU 사용률 변화율 (예: "+2.1%", "-0.5%")
    avg_memory_change: str  # 평균 메모리 사용률 변화율 (예: "+1.3%", "-2.0%")
    network_traffic_change: str  # 네트워크 트래픽 변화율 (예: "+5%", "-3%")


class DashboardStats(BaseModel):
    """대시보드 전체 통계 정보 모델"""
    containers: ContainerStats  # 컨테이너 통계 정보 (ContainerStats 객체)
    nodes: NodeStats  # 노드 통계 정보 (NodeStats 객체)
    resources: ResourceStats  # 리소스 사용 통계 정보 (ResourceStats 객체)

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

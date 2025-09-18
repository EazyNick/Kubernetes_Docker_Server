"""
홈 페이지 개요 통계를 위한 데이터 모델
"""
from pydantic import BaseModel
from typing import Optional


class OverviewStats(BaseModel):
    """홈 페이지 개요 통계 모델"""
    total_containers: int  # 전체 컨테이너 수 (예: 147, 200, 50)
    running_containers: int  # 실행 중인 컨테이너 수 (예: 134, 180, 45)
    active_nodes: int  # 활성 노드 수 (예: 12, 8, 3)
    healthy_nodes: int  # 정상 상태 노드 수 (예: 11, 7, 2)
    system_health: float  # 시스템 전체 상태 (백분율, 예: 98.5 = 98.5%)
    uptime: float  # 시스템 가동률 (백분율, 예: 99.9 = 99.9%)
    warning_alerts: int  # 경고 알림 수 (예: 3, 0, 15)
    critical_alerts: int  # 위험 알림 수 (예: 1, 0, 5)
    
    # 변화량 필드들 (이전 시간대 대비 변화)
    total_containers_change: str  # 전체 컨테이너 변화량 (예: "+2%", "-1%", "+0%")
    running_containers_change: str  # 실행 중인 컨테이너 변화량 (예: "+1%", "-2%", "+0%")
    active_nodes_change: str  # 활성 노드 변화량 (예: "+0%", "+1%", "-1%")
    healthy_nodes_change: str  # 정상 노드 변화량 (예: "+1%", "+0%", "-1%")
    system_health_change: str  # 시스템 상태 변화량 (예: "+0.2%", "-0.5%", "+0%")
    uptime_change: str  # 가동률 변화량 (예: "+0.1%", "+0%", "-0.1%")
    warning_alerts_change: str  # 경고 알림 변화량 (예: "-1%", "+2%", "+0%")
    critical_alerts_change: str  # 위험 알림 변화량 (예: "+0%", "+1%", "-1%")

    class Config:
        json_schema_extra = {
            "example": {
                "total_containers": 147,
                "running_containers": 134,
                "active_nodes": 12,
                "healthy_nodes": 11,
                "system_health": 98.5,
                "uptime": 99.9,
                "warning_alerts": 3,
                "critical_alerts": 1,
                "total_containers_change": "+2%",
                "running_containers_change": "+1%",
                "active_nodes_change": "+0%",
                "healthy_nodes_change": "+1%",
                "system_health_change": "+0.2%",
                "uptime_change": "+0.1%",
                "warning_alerts_change": "-1%",
                "critical_alerts_change": "+0%"
            }
        }


class NodePageStats(BaseModel):
    """노드 페이지 통계 모델"""
    healthy_nodes: int  # 정상 상태 노드 수 (예: 11, 7, 2)
    warning_nodes: int  # 경고 상태 노드 수 (예: 1, 3, 0)
    total_cores: int  # 전체 CPU 코어 수 (예: 48, 32, 16)
    total_memory: int  # 전체 메모리 용량 (GB 단위, 예: 192, 128, 64)
    avg_cpu_usage: float  # 평균 CPU 사용률 (백분율, 예: 35.2 = 35.2%)
    avg_memory_usage: float  # 평균 메모리 사용률 (백분율, 예: 68.5 = 68.5%)
    
    # 변화량 필드들 (이전 시간대 대비 변화)
    healthy_nodes_change: str  # 정상 노드 변화량 (예: "+1%", "-1%", "+0%")
    warning_nodes_change: str  # 경고 노드 변화량 (예: "-1%", "+2%", "+0%")
    total_cores_change: str  # 총 CPU 코어 변화량 (예: "+0%", "+4%", "+0%")
    total_memory_change: str  # 총 메모리 변화량 (예: "+0%", "+8GB", "+0%")
    avg_cpu_usage_change: str  # 평균 CPU 사용률 변화량 (예: "+2.1%", "-1.5%", "+0%")
    avg_memory_usage_change: str  # 평균 메모리 사용률 변화량 (예: "+1.3%", "-0.8%", "+0%")

    class Config:
        json_schema_extra = {
            "example": {
                "healthy_nodes": 11,
                "warning_nodes": 1,
                "total_cores": 48,
                "total_memory": 192,
                "avg_cpu_usage": 35.2,
                "avg_memory_usage": 68.5,
                "healthy_nodes_change": "+1%",
                "warning_nodes_change": "-1%",
                "total_cores_change": "+0%",
                "total_memory_change": "+0%",
                "avg_cpu_usage_change": "+2.1%",
                "avg_memory_usage_change": "+1.3%"
            }
        }

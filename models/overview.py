"""
홈 페이지 개요 통계를 위한 데이터 모델
"""
from pydantic import BaseModel


class OverviewStats(BaseModel):
    """홈 페이지 개요 통계"""
    total_containers: int      # 전체 컨테이너 수
    running_containers: int    # 실행중 컨테이너 수
    active_nodes: int          # 활성 노드 수
    healthy_nodes: int         # 정상 노드 수
    system_health: float       # 시스템 상태 (%)
    uptime: float              # 가동률 (%)
    warning_alerts: int        # 경고 알림 수
    critical_alerts: int       # 위험 알림 수

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
                "critical_alerts": 1
            }
        }

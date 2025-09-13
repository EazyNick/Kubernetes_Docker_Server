"""
알림 관련 데이터 모델
"""
from typing import List
from pydantic import BaseModel


class Alert(BaseModel):
    """개별 알림 정보"""
    id: str  # 알림 고유 식별자
    alert_type: str  # 알림 유형/카테고리 (예: "High Memory Usage", "CPU Overload", "Disk Space Low")
    target: str  # 알림 대상 (노드/컨테이너 이름)
    message: str  # 알림 상세 메시지 (구체적인 상황 설명)
    severity: str  # 알림 심각도 ("Critical", "Warning", "Info")
    status: str  # 알림 상태 ("Active", "Resolved", "Suppressed")
    created_at: str  # 알림 생성 시간 (ISO 8601 형식)
    duration: str  # 알림 지속 시간 (예: "15분", "2시간")
    source: str  # 알림 발생 소스 (예: "kubelet", "deployment-controller")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "ALT-001",
                "alert_type": "High Memory Usage",
                "target": "k8s-worker-01",
                "message": "Memory usage exceeded 90% on k8s-worker-01 for more than 5 minutes",
                "severity": "Warning",
                "status": "Active",
                "created_at": "2024-01-15T09:30:00Z",
                "duration": "15분",
                "source": "kubelet"
            }
        }


class AlertSummary(BaseModel):
    """알림 요약 정보"""
    critical: int  # 위험 알림 수
    warning: int  # 경고 알림 수
    info: int  # 정보 알림 수
    resolved: int  # 해결된 알림 수


class AlertList(BaseModel):
    """알림 목록과 요약 정보"""
    alerts: List[Alert]
    summary: AlertSummary

    class Config:
        json_schema_extra = {
            "example": {
                "alerts": [
                    {
                        "id": "ALT-001",
                        "alert_type": "High Memory Usage",
                        "target": "k8s-worker-01",
                        "message": "Memory usage exceeded 90% on k8s-worker-01 for more than 5 minutes",
                        "severity": "Warning",
                        "status": "Active",
                        "created_at": "2024-01-15T09:30:00Z",
                        "duration": "15분",
                        "source": "kubelet"
                    }
                ],
                "summary": {
                    "critical": 2,
                    "warning": 5,
                    "info": 3,
                    "resolved": 12
                }
            }
        }

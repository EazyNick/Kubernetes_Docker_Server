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
    """알림 요약 통계 정보"""
    critical: int  # 위험(Critical) 심각도 알림 개수 (즉시 조치 필요)
    warning: int  # 경고(Warning) 심각도 알림 개수 (주의 깊게 모니터링 필요)
    info: int  # 정보(Info) 심각도 알림 개수 (참고용 정보)
    resolved: int  # 해결된(Resolved) 상태 알림 개수 (최근 24시간 내)


class AlertList(BaseModel):
    """알림 목록과 요약 통계를 포함한 응답 모델"""
    alerts: List[Alert]  # 개별 알림 객체들의 배열 (최신순 정렬)
    summary: AlertSummary  # 알림 요약 통계 정보 (대시보드 표시용)

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


class AlertRule(BaseModel):
    """알림 규칙 정의 모델"""
    id: str  # 규칙 고유 식별자 (예: "RULE-001", "RULE-CPU-001")
    name: str  # 규칙명 (예: "High CPU Usage", "Memory Warning", "Disk Space Alert")
    target: str  # 규칙 적용 대상 (예: "모든 노드", "특정 컨테이너", "nginx-*", "k8s-worker-*")
    condition: str  # 규칙 조건 표현식 (예: "CPU > 85% for 5min", "Memory > 90% for 2min", "Disk < 10%")
    severity: str  # 규칙 심각도 레벨 ("Critical"=위험, "Warning"=경고, "Info"=정보)
    status: str  # 규칙 현재 상태 ("Active"=활성, "Inactive"=비활성, "Testing"=테스트중)
    created_at: str  # 규칙 생성 시간 (ISO 8601 형식, 예: "2024-01-15T09:30:00Z")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "RULE-001",
                "name": "High CPU Usage",
                "target": "모든 노드",
                "condition": "CPU > 85% for 5min",
                "severity": "Critical",
                "status": "Active",
                "created_at": "2024-01-15T09:30:00Z"
            }
        }


class AlertRuleList(BaseModel):
    """알림 규칙 목록 응답 모델"""
    rules: List[AlertRule]  # 알림 규칙 객체들의 배열 (이름순 또는 생성일순 정렬)

    class Config:
        json_schema_extra = {
            "example": {
                "rules": [
                    {
                        "id": "RULE-001",
                        "name": "High CPU Usage",
                        "target": "모든 노드",
                        "condition": "CPU > 85% for 5min",
                        "severity": "Critical",
                        "status": "Active",
                        "created_at": "2024-01-15T09:30:00Z"
                    }
                ]
            }
        }
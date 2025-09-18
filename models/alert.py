"""
알림 관련 데이터 모델
"""
from typing import List, Optional
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


class AlertDetail(BaseModel):
    """알림 상세 정보 (모달 표시용)"""
    id: str  # 알림 고유 식별자
    alert_type: str  # 알림 유형/카테고리
    target: str  # 알림 대상 (노드/컨테이너 이름)
    message: str  # 알림 상세 메시지
    description: str  # 알림 상세 설명 (추가 컨텍스트)
    severity: str  # 알림 심각도 ("Critical", "Warning", "Info")
    status: str  # 알림 상태 ("Active", "Resolved", "Suppressed")
    created_at: str  # 알림 생성 시간 (ISO 8601 형식)
    updated_at: str  # 마지막 업데이트 시간 (ISO 8601 형식)
    resolved_at: Optional[str]  # 해결 시간 (ISO 8601 형식, 해결되지 않은 경우 null)
    duration: str  # 알림 지속 시간 (예: "15분", "2시간")
    source: str  # 알림 발생 소스 (예: "kubelet", "deployment-controller")
    labels: dict  # 알림 라벨 (키-값 쌍, 예: {"namespace": "default", "pod": "nginx-123"})
    metric_value: str  # 현재 메트릭 값 (예: "92.5%", "1.2GB", "150ms")
    # 메트릭 값(Metric Value)은 모니터링 시스템에서 측정하는 수치 데이터
    # 주요 메트릭 종류:
    # - CPU 사용률: "85.3%" (0-100%)
    # - 메모리 사용량: "2.1GB" 또는 "78.5%" (절대값 또는 비율)
    # - 디스크 사용률: "95.7%" (0-100%)
    # - 네트워크 트래픽: "150Mbps" (대역폭), "1.2GB" (전송량)
    # - 응답 시간: "150ms" (지연시간)
    # - 연결 수: "1250" (동시 연결)
    # - 에러율: "2.3%" (0-100%)
    # - 큐 길이: "45" (대기 중인 작업 수)
    threshold: str  # 임계값 (예: "90%", "1GB", "100ms")
    # 임계값(Threshold)은 알림이 발생하는 기준값
    # 메트릭 값이 이 값을 초과하거나 미달할 때 알림 발생
    # 예: CPU 85.3% (메트릭) > 80% (임계값) → 알림 발생
    resolution_notes: str  # 해결 노트 (관리자가 추가한 해결 방법이나 참고사항)
    affected_services: List[str]  # 영향받는 서비스 목록
    escalation_level: int  # 에스컬레이션 레벨 (1-5, 5가 최고 우선순위)
    assigned_to: str  # 담당자 (예: "admin", "devops-team", "on-call-engineer")
    tags: List[str]  # 태그 목록 (예: ["production", "urgent", "infrastructure"])

    class Config:
        json_schema_extra = {
            "example": {
                "id": "ALT-001",
                "alert_type": "High Memory Usage",
                "target": "k8s-worker-01",
                "message": "Memory usage exceeded 90% on k8s-worker-01 for more than 5 minutes",
                "description": "The worker node k8s-worker-01 has been experiencing high memory usage consistently for the past 15 minutes. This is likely due to a memory leak in one of the running containers or an increase in application load.",
                "severity": "Warning",
                "status": "Active",
                "created_at": "2024-01-15T09:30:00Z",
                "updated_at": "2024-01-15T09:45:00Z",
                "resolved_at": None,
                "duration": "15분",
                "source": "kubelet",
                "labels": {
                    "namespace": "default",
                    "pod": "nginx-deployment-123",
                    "node": "k8s-worker-01",
                    "cluster": "production"
                },
                "metric_value": "92.5%",
                "threshold": "90%",
                "resolution_notes": "Monitoring memory usage trends. Consider scaling up the node or optimizing container resource limits.",
                "affected_services": ["nginx", "api-gateway", "user-service"],
                "escalation_level": 3,
                "assigned_to": "devops-team",
                "tags": ["production", "memory", "worker-node"]
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
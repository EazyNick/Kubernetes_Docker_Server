"""
이벤트 관련 데이터 모델
"""
from typing import List
from pydantic import BaseModel


class Event(BaseModel):
    """개별 이벤트 정보 모델"""
    time: str  # 이벤트 발생 시간 (HH:MM:SS 형식, 예: "10:30:15")
    type: str  # 이벤트 유형 ("Normal"=정상, "Warning"=경고, "Error"=오류)
    object: str  # 이벤트 대상 객체 (예: "pod-nginx-001", "deployment-web", "node-worker-01")
    namespace: str  # Kubernetes 네임스페이스 (예: "default", "kube-system", "monitoring")
    reason: str  # 이벤트 발생 원인 (예: "Started", "Pulled", "Failed", "Created", "Updated")
    message: str  # 이벤트 상세 메시지 (예: "Started event occurred for pod", "Successfully pulled image")
    source: str  # 이벤트 발생 소스 (예: "kubelet", "deployment-controller", "scheduler")

    class Config:
        json_schema_extra = {
            "example": {
                "time": "10:30:15",
                "type": "Normal",
                "object": "pod-nginx-001",
                "namespace": "default",
                "reason": "Started",
                "message": "Started event occurred for pod",
                "source": "kubelet"
            }
        }


class EventSummary(BaseModel):
    """이벤트 요약 통계 정보 모델"""
    today_events: int  # 오늘 발생한 전체 이벤트 수 (예: 45)
    warning_events: int  # 경고(Warning) 유형 이벤트 수 (예: 5)
    normal_events: int  # 정상(Normal) 유형 이벤트 수 (예: 35)
    system_events: int  # 시스템 관련 이벤트 수 (예: 5, kube-system 네임스페이스 등)
    # 변화량 데이터 (화살표 방향 표시용)
    today_events_change: str  # 오늘 이벤트 변화량 (예: "+5%", "-2%", "0%")
    warning_events_change: str  # 경고 이벤트 변화량 (예: "+3%", "-1%", "0%")
    normal_events_change: str  # 정상 이벤트 변화량 (예: "+2%", "-1%", "0%")
    system_events_change: str  # 시스템 이벤트 변화량 (예: "+1%", "-1%", "0%")


class EventList(BaseModel):
    """이벤트 목록과 요약 통계를 포함한 응답 모델"""
    events: List[Event]  # 개별 이벤트 객체들의 배열 (최신순 정렬)
    summary: EventSummary  # 이벤트 요약 통계 정보 (대시보드 표시용)

    class Config:
        json_schema_extra = {
            "example": {
                "events": [
                    {
                        "time": "10:30:15",
                        "type": "Normal",
                        "object": "pod-nginx-001",
                        "namespace": "default",
                        "reason": "Started",
                        "message": "Started event occurred for pod",
                        "source": "kubelet"
                    }
                ],
                "summary": {
                    "today_events": 45,
                    "warning_events": 5,
                    "normal_events": 35,
                    "system_events": 5
                }
            }
        }

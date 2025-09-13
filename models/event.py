"""
이벤트 관련 데이터 모델
"""
from typing import List
from pydantic import BaseModel


class Event(BaseModel):
    """개별 이벤트 정보"""
    time: str  # 이벤트 시간 (HH:MM:SS)
    type: str  # "Normal", "Warning"
    object: str  # 이벤트 대상 객체
    namespace: str  # 네임스페이스
    reason: str  # 이벤트 원인
    message: str  # 이벤트 메시지
    source: str  # 이벤트 소스

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
    """이벤트 요약 정보"""
    today_events: int  # 오늘 이벤트 수
    warning_events: int  # 경고 이벤트 수
    normal_events: int  # 정상 이벤트 수
    system_events: int  # 시스템 이벤트 수


class EventList(BaseModel):
    """이벤트 목록과 요약 정보"""
    events: List[Event]
    summary: EventSummary

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

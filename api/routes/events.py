"""
이벤트 관련 API 라우트
시스템 이벤트 및 로그 정보를 제공
"""
from fastapi import APIRouter
from models import (
    BaseResponse,
    Event,
    EventList,
    EventSummary
)
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(prefix="/api", tags=["events"])

@router.get("/events", response_model=BaseResponse)
def get_events():
    """이벤트 목록 조회"""
    try:
        events = []
        event_types = ["Pod", "Node", "Service", "Deployment", "ServiceAccount", "PersistentVolumeClaim"]
        reasons = ["Started", "Pulling", "Scheduled", "BackOff", "NodeReady", "UpdatedLoadBalancer", "FailedMount", "TokenRequested"]
        
        for i in range(25):
            event_type = random.choice(event_types)
            reason = random.choice(reasons)
            events.append(Event(
                time=(datetime.now() - timedelta(minutes=random.randint(1, 1440))).strftime("%H:%M:%S"),
                type=random.choice(["Normal", "Warning"]),
                object=f"{event_type.lower()}-{random.randint(1, 100)}",
                namespace=random.choice(["default", "kube-system", "monitoring"]),
                reason=reason,
                message=f"{reason} event occurred for {event_type.lower()}",
                source=random.choice(["kubelet", "deployment-controller", "service-controller", "node-controller"])
            ))
        
        event_list = EventList(
            events=events,
            summary=EventSummary(
                today_events=len(events),
                warning_events=len([e for e in events if e.type == "Warning"]),
                normal_events=len([e for e in events if e.type == "Normal"]),
                system_events=len([e for e in events if e.namespace == "kube-system"])
            )
        )
        
        return BaseResponse.success_response(
            data=event_list.dict(),
            message="Events retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve events",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.get("/events/{event_id}", response_model=BaseResponse)
def get_event(event_id: str):
    """특정 이벤트 상세 정보 조회"""
    try:
        # 실제 구현에서는 데이터베이스에서 특정 이벤트 정보를 가져옴
        event = Event(
            time=datetime.now().strftime("%H:%M:%S"),
            type=random.choice(["Normal", "Warning"]),
            object=f"object-{event_id}",
            namespace=random.choice(["default", "kube-system", "monitoring"]),
            reason=random.choice(["Started", "Pulling", "Scheduled"]),
            message=f"Event {event_id} details",
            source=random.choice(["kubelet", "deployment-controller", "service-controller"])
        )
        
        return BaseResponse.success_response(
            data=event.dict(),
            message="Event retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve event",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.get("/events/namespace/{namespace}", response_model=BaseResponse)
def get_events_by_namespace(namespace: str):
    """특정 네임스페이스의 이벤트 조회"""
    try:
        # 실제 구현에서는 데이터베이스에서 특정 네임스페이스의 이벤트를 가져옴
        events = []
        for i in range(10):
            events.append(Event(
                time=(datetime.now() - timedelta(minutes=random.randint(1, 1440))).strftime("%H:%M:%S"),
                type=random.choice(["Normal", "Warning"]),
                object=f"object-{i+1}",
                namespace=namespace,
                reason=random.choice(["Started", "Pulling", "Scheduled"]),
                message=f"Event in namespace {namespace}",
                source=random.choice(["kubelet", "deployment-controller"])
            ))
        
        event_list = EventList(
            events=events,
            summary=EventSummary(
                today_events=len(events),
                warning_events=len([e for e in events if e.type == "Warning"]),
                normal_events=len([e for e in events if e.type == "Normal"]),
                system_events=len([e for e in events if e.namespace == "kube-system"])
            )
        )
        
        return BaseResponse.success_response(
            data=event_list.dict(),
            message=f"Events for namespace {namespace} retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve events by namespace",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

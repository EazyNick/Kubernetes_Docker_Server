"""
알림 관련 API 라우트
시스템 알림 및 경고 정보를 제공
"""
from fastapi import APIRouter
from models import (
    BaseResponse,
    Alert,
    AlertList,
    AlertSummary
)
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(prefix="/api", tags=["alerts"])

@router.get("/alerts", response_model=BaseResponse)
def get_alerts():
    """알림 목록 조회"""
    try:
        alerts = []
        alert_types = ["High Memory Usage", "High CPU Usage", "Container Restart Loop", "Disk Space Low", "High Network Traffic", "Pod Scheduled"]
        severities = ["Critical", "Warning", "Info"]
        
        for i in range(15):
            severity = random.choice(severities)
            alert_type = random.choice(alert_types)
            alerts.append(Alert(
                id=f"ALT-{i+1:03d}",
                alert_type=alert_type,
                target=f"k8s-{random.choice(['master', 'worker'])}-{random.randint(1, 3)}",
                message=f"{alert_type} detected on k8s-{random.choice(['master', 'worker'])}-{random.randint(1, 3)} for more than {random.randint(5, 30)} minutes",
                severity=severity,
                status=random.choice(["Active", "Resolved"]),
                created_at=(datetime.now() - timedelta(minutes=random.randint(1, 1440))).isoformat() + "Z",
                duration=f"{random.randint(5, 60)}분",
                source=random.choice(["kubelet", "deployment-controller", "service-controller"])
            ))
        
        alert_list = AlertList(
            alerts=alerts,
            summary=AlertSummary(
                critical=len([a for a in alerts if a.severity == "Critical"]),
                warning=len([a for a in alerts if a.severity == "Warning"]),
                info=len([a for a in alerts if a.severity == "Info"]),
                resolved=len([a for a in alerts if a.status == "Resolved"])
            )
        )
        
        return BaseResponse.success_response(
            data=alert_list.dict(),
            message="Alerts retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve alerts",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.get("/alerts/{alert_id}", response_model=BaseResponse)
def get_alert(alert_id: str):
    """특정 알림 상세 정보 조회"""
    try:
        # 실제 구현에서는 데이터베이스에서 특정 알림 정보를 가져옴
        alert = Alert(
            id=alert_id,
            alert_type=random.choice(["High Memory Usage", "High CPU Usage", "Container Restart Loop"]),
            target=f"k8s-{random.choice(['master', 'worker'])}-{random.randint(1, 3)}",
            message=f"Alert {alert_id} details",
            severity=random.choice(["Critical", "Warning", "Info"]),
            status=random.choice(["Active", "Resolved"]),
            created_at=(datetime.now() - timedelta(minutes=random.randint(1, 1440))).isoformat() + "Z",
            duration=f"{random.randint(5, 60)}분",
            source=random.choice(["kubelet", "deployment-controller", "service-controller"])
        )
        
        return BaseResponse.success_response(
            data=alert.dict(),
            message="Alert retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve alert",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.put("/alerts/{alert_id}/resolve", response_model=BaseResponse)
def resolve_alert(alert_id: str):
    """알림 해결 처리"""
    try:
        # 실제 구현에서는 데이터베이스에서 알림 상태를 업데이트
        return BaseResponse.success_response(
            data={"alert_id": alert_id, "status": "Resolved"},
            message="Alert resolved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to resolve alert",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

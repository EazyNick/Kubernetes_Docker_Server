"""
알림 관련 API 라우트
시스템 알림 및 경고 정보를 제공
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models import (
    BaseResponse,
    Alert,
    AlertDetail,
    AlertList,
    AlertSummary,
    AlertRule,
    AlertRuleList,
    AlertRuleUpdate
)
from api.routes.auth import get_current_user_from_token
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(
    prefix="/api",
    tags=["alerts"],
    dependencies=[Depends(get_current_user_from_token)]
)

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
                resolved=len([a for a in alerts if a.status == "Resolved"]),
                # 변화량 데이터 (화살표 방향 표시용)
                critical_change=random.choice([f"{random.choice(['+', '-'])}{random.randint(0, 3)}%", "0%"]),
                warning_change=random.choice([f"{random.choice(['+', '-'])}{random.randint(0, 2)}%", "0%"]),
                info_change=random.choice([f"{random.choice(['+', '-'])}{random.randint(0, 2)}%", "0%"]),
                resolved_change=random.choice([f"{random.choice(['+', '-'])}{random.randint(0, 5)}%", "0%"])
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
    """특정 알림 기본 정보 조회"""
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

@router.get("/alerts/{alert_id}/detail", response_model=BaseResponse)
def get_alert_detail(alert_id: str):
    """특정 알림 상세 정보 조회 (상세보기용)"""
    try:
        # 실제 구현에서는 데이터베이스에서 특정 알림 상세 정보를 가져옴
        # 현재는 임의의 상세 데이터를 생성하여 반환
        
        alert_types = ["High Memory Usage", "High CPU Usage", "Container Restart Loop", "Disk Space Low", "High Network Traffic"]
        severities = ["Critical", "Warning", "Info"]
        statuses = ["Active", "Resolved"]
        sources = ["kubelet", "deployment-controller", "service-controller", "node-exporter", "prometheus"]
        
        alert_type = random.choice(alert_types)
        severity = random.choice(severities)
        status = random.choice(statuses)
        target = f"k8s-{random.choice(['master', 'worker'])}-{random.randint(1, 3)}"
        created_time = datetime.now() - timedelta(minutes=random.randint(1, 1440))
        updated_time = created_time + timedelta(minutes=random.randint(1, 30))
        
        # 해결된 경우 해결 시간 설정
        resolved_at = None
        if status == "Resolved":
            resolved_at = (updated_time + timedelta(minutes=random.randint(1, 60))).isoformat() + "Z"
        
        # 라벨 생성
        labels = {
            "namespace": random.choice(["default", "kube-system", "monitoring", "production"]),
            "pod": f"{random.choice(['nginx', 'api', 'web', 'db'])}-{random.randint(100, 999)}",
            "node": target,
            "cluster": "production",
            "environment": random.choice(["prod", "staging", "dev"])
        }
        
        # 영향받는 서비스 목록
        affected_services = random.sample(
            ["nginx", "api-gateway", "user-service", "payment-service", "notification-service", "auth-service"],
            random.randint(1, 3)
        )
        
        # 태그 목록
        tags = random.sample(
            ["production", "urgent", "infrastructure", "memory", "cpu", "network", "storage", "worker-node"],
            random.randint(2, 4)
        )
        
        # 메트릭 값과 임계값 생성
        metric_values = {
            "High Memory Usage": ("92.5%", "90%"),
            "High CPU Usage": ("87.3%", "85%"),
            "Container Restart Loop": ("8회", "5회"),
            "Disk Space Low": ("8.2GB", "10GB"),
            "High Network Traffic": ("150ms", "100ms")
        }
        
        metric_value, threshold = metric_values.get(alert_type, ("N/A", "N/A"))
        
        alert_detail = AlertDetail(
            id=alert_id,
            alert_type=alert_type,
            target=target,
            message=f"{alert_type} detected on {target} for more than {random.randint(5, 30)} minutes",
            description=f"The {target} node has been experiencing {alert_type.lower()} consistently for the past {random.randint(10, 60)} minutes. This is likely due to increased load or resource constraints in the cluster.",
            severity=severity,
            status=status,
            created_at=created_time.isoformat() + "Z",
            updated_at=updated_time.isoformat() + "Z",
            resolved_at=resolved_at,
            duration=f"{random.randint(5, 60)}분",
            source=random.choice(sources),
            labels=labels,
            metric_value=metric_value,
            threshold=threshold,
            resolution_notes=f"Monitoring {alert_type.lower()} trends. Consider scaling up resources or optimizing configuration." if status == "Active" else "Issue has been resolved by scaling up node resources.",
            affected_services=affected_services,
            escalation_level=random.randint(1, 5),
            assigned_to=random.choice(["admin", "devops-team", "on-call-engineer", "platform-team"]),
            tags=tags
        )
        
        return BaseResponse.success_response(
            data={"alert": alert_detail.dict()},
            message="Alert detail retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve alert detail",
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

@router.get("/alert-rules", response_model=BaseResponse)
def get_alert_rules(db: Session = Depends(get_db)):
    """알림 규칙 목록 조회"""
    try:
        # 데이터베이스에서 모든 알림 규칙을 조회
        rules_db = db.query(AlertRuleDB).order_by(AlertRuleDB.id.desc()).all()
        
        # SQLAlchemy 모델 객체를 Pydantic 모델 객체로 변환
        rules_pydantic = [AlertRule(
            id=f"RULE-{rule.id:03d}",
            name=rule.name,
            target=rule.target,
            condition=rule.condition,
            severity=rule.severity,
            status=rule.status,
            created_at=rule.created_at.isoformat() + "Z"
        ) for rule in rules_db]
        
        rule_list = AlertRuleList(rules=rules_pydantic)
        
        return BaseResponse.success_response(
            data=rule_list.dict(),
            message="Alert rules retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve alert rules",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.put("/alert-rules/{rule_id}", response_model=BaseResponse)
def update_alert_rule(rule_id: str, rule_update: AlertRuleUpdate, db: Session = Depends(get_db)):
    """알림 규칙 수정"""
    try:
        # "RULE-001" 형식의 ID에서 숫자 부분만 추출
        try:
            rule_numeric_id = int(rule_id.split('-')[1])
        except (IndexError, ValueError):
            return BaseResponse.error_response(
                message="Invalid rule ID format",
                error_code="INVALID_RULE_ID",
                details="Rule ID must be in format 'RULE-XXX'"
            )

        # 데이터베이스에서 해당 규칙 조회
        rule_db = db.query(AlertRuleDB).filter(AlertRuleDB.id == rule_numeric_id).first()

        if not rule_db:
            return BaseResponse.error_response(
                message="Alert rule not found",
                error_code="NOT_FOUND",
                details=f"Rule with id {rule_id} not found"
            )

        # 받은 데이터로 규칙 업데이트
        update_data = rule_update.dict()
        for key, value in update_data.items():
            setattr(rule_db, key, value)
        
        db.commit()
        db.refresh(rule_db)

        # Pydantic 모델로 변환하여 반환
        updated_rule_pydantic = AlertRule(
            id=f"RULE-{rule_db.id:03d}",
            name=rule_db.name,
            target=rule_db.target,
            condition=rule_db.condition,
            severity=rule_db.severity,
            status=rule_db.status,
            created_at=rule_db.created_at.isoformat() + "Z"
        )

        return BaseResponse.success_response(
            data={"rule": updated_rule_pydantic.dict(), "updated": True},
            message="Alert rule updated successfully"
        )
            
    except Exception as e:
        db.rollback()
        return BaseResponse.error_response(
            message="Failed to update alert rule",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.delete("/alert-rules/{rule_id}", response_model=BaseResponse)
def delete_alert_rule(rule_id: str, db: Session = Depends(get_db)):
    """알림 규칙 삭제"""
    try:
        # "RULE-001" 형식의 ID에서 숫자 부분만 추출
        try:
            rule_numeric_id = int(rule_id.split('-')[1])
        except (IndexError, ValueError):
            return BaseResponse.error_response(
                message="Invalid rule ID format",
                error_code="INVALID_RULE_ID",
                details="Rule ID must be in format 'RULE-XXX'"
            )

        # 데이터베이스에서 해당 규칙 조회
        rule_db = db.query(AlertRuleDB).filter(AlertRuleDB.id == rule_numeric_id).first()

        if not rule_db:
            return BaseResponse.error_response(
                message="Alert rule not found",
                error_code="NOT_FOUND",
                details=f"Rule with id {rule_id} not found"
            )

        # 규칙 삭제
        db.delete(rule_db)
        db.commit()

        return BaseResponse.success_response(
            data={"rule_id": rule_id, "deleted": True},
            message="Alert rule deleted successfully"
        )
            
    except Exception as e:
        db.rollback()
        return BaseResponse.error_response(
            message="Failed to delete alert rule",
            error_code="DATABASE_ERROR",
            details=str(e)
        )
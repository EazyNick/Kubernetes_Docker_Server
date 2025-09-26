"""
알림 관련 API 라우트
시스템 알림 및 경고 정보를 제공
"""
from fastapi import APIRouter
from models import (
    BaseResponse,
    Alert,
    AlertDetail,
    AlertList,
    AlertSummary,
    AlertRule,
    AlertRuleList
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
def get_alert_rules():
    """알림 규칙 목록 조회"""
    try:
        # TODO: 백엔드 개발자 구현 필요
        # 1. 데이터베이스에서 알림 규칙 목록 조회
        # 2. 데이터베이스에서 규칙 상태 관리 
        # 3. 데이터베이스에서 규칙별 임계값 조회 
        # 4. 데이터베이스에서 규칙별 대상 노드/컨테이너 조회 
        
        # 현재는 랜덤 데이터로 시뮬레이션
        rules = []
        rule_names = [
            "High CPU Usage", "High Memory Usage", "Container Restart Loop", 
            "Disk Space Warning", "Network Latency", "Pod CrashLoopBackOff",
            "Node Not Ready", "Service Unavailable", "High Disk I/O"
        ]
        targets = ["모든 노드", "모든 컨테이너", "Kubernetes 클러스터", "특정 네임스페이스"]
        conditions = [
            "CPU > 85% for 5min", "Memory > 90% for 3min", "Restart count > 3 in 10min",
            "Disk usage > 80%", "Latency > 100ms", "Pod restart > 5 in 5min",
            "Node status != Ready", "Service endpoints = 0", "Disk I/O > 100MB/s"
        ]
        severities = ["Critical", "Warning", "Info"]
        statuses = ["Active", "Inactive", "Testing"]
        
        for i in range(8):
            rule_name = random.choice(rule_names)
            rules.append(AlertRule(
                id=f"RULE-{i+1:03d}",
                name=rule_name,
                target=random.choice(targets),
                condition=random.choice(conditions),
                severity=random.choice(severities),
                status=random.choice(statuses),
                created_at=(datetime.now() - timedelta(days=random.randint(1, 30))).isoformat() + "Z"
            ))
        
        rule_list = AlertRuleList(rules=rules)
        
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
def update_alert_rule(rule_id: str, rule_data: dict):
    """알림 규칙 수정"""
    try:
        # TODO: 백엔드 개발자 구현 필요
        # 1. 데이터베이스에서 해당 규칙 존재 여부 확인
        # 2. 규칙이 존재하는 경우 업데이트 처리
        # 3. 업데이트 성공/실패 여부 반환
        
        # 규칙 ID가 유효한 형식인지 확인 (RULE-XXX 형식)
        if not rule_id.startswith("RULE-") or len(rule_id) < 8:
            return BaseResponse.error_response(
                message="Invalid rule ID format",
                error_code="INVALID_RULE_ID",
                details="Rule ID must be in format 'RULE-XXX'"
            )
        
        # 필수 필드 검증
        required_fields = ["name", "target", "condition", "severity", "status"]
        for field in required_fields:
            if field not in rule_data or not rule_data[field]:
                return BaseResponse.error_response(
                    message=f"Missing required field: {field}",
                    error_code="MISSING_FIELD",
                    details=f"The field '{field}' is required"
                )
        
        # 무조건 성공 처리
        updated_rule = {
            "id": rule_id,
            "name": rule_data["name"],
            "target": rule_data["target"],
            "condition": rule_data["condition"],
            "severity": rule_data["severity"],
            "status": rule_data["status"],
            "created_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat() + "Z"
        }
        return BaseResponse.success_response(
            data={"rule": updated_rule, "updated": True},
            message="Alert rule updated successfully"
        )
            
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to update alert rule",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.delete("/alert-rules/{rule_id}", response_model=BaseResponse)
def delete_alert_rule(rule_id: str):
    """알림 규칙 삭제"""
    try:
        # TODO: 백엔드 개발자 구현 필요
        # 1. 데이터베이스에서 해당 규칙 존재 여부 확인
        # 2. 규칙이 존재하는 경우 삭제 처리
        # 3. 관련된 알림 이력도 함께 삭제
        # 4. 삭제 성공/실패 여부 반환
        
        # 규칙 ID가 유효한 형식인지 확인 (RULE-XXX 형식)
        if not rule_id.startswith("RULE-") or len(rule_id) < 8:
            return BaseResponse.error_response(
                message="Invalid rule ID format",
                error_code="INVALID_RULE_ID",
                details="Rule ID must be in format 'RULE-XXX'"
            )
        
        # 무조건 성공 처리
        return BaseResponse.success_response(
            data={"rule_id": rule_id, "deleted": True},
            message="Alert rule deleted successfully"
        )
            
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to delete alert rule",
            error_code="DATABASE_ERROR",
            details=str(e)
        )
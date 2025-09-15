"""
로그 관련 데이터 모델
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class LogEntry(BaseModel):
    """개별 로그 엔트리 모델"""
    id: str  # 로그 고유 식별자 (예: "log-001", "abc123def456")
    level: str  # 로그 레벨 ("info"=정보, "warn"=경고, "error"=오류, "debug"=디버그)
    message: str  # 로그 메시지 내용 (예: "User login successful", "Database connection failed")
    source: str  # 로그 발생 소스 (컨테이너명 또는 서비스명, 예: "nginx", "api-server", "database")
    namespace: Optional[str] = None  # Kubernetes 네임스페이스 (예: "default", "kube-system")
    pod_name: Optional[str] = None  # Pod 이름 (예: "nginx-pod-abc123", "api-deployment-xyz789")
    container_name: Optional[str] = None  # 컨테이너 이름 (예: "nginx", "api", "sidecar")
    timestamp: str  # 로그 발생 시간 (ISO 8601 형식, 예: "2024-01-15T10:30:15Z")


class LogStats(BaseModel):
    """로그 통계 정보 모델"""
    total_logs: int  # 전체 로그 수 (예: 1250)
    info_count: int  # INFO 레벨 로그 수 (예: 800)
    warn_count: int  # WARN 레벨 로그 수 (예: 300)
    error_count: int  # ERROR 레벨 로그 수 (예: 100)
    debug_count: int  # DEBUG 레벨 로그 수 (예: 50)
    time_range: str  # 통계 시간 범위 (예: "Last 24 hours", "Last 7 days", "2024-01-15 00:00 - 23:59")


class LogResponse(BaseModel):
    """로그 API 기본 응답 모델"""
    success: bool  # API 호출 성공 여부 (true=성공, false=실패)
    message: str  # 응답 메시지 (예: "로그 조회 성공", "로그를 찾을 수 없습니다")
    data: Optional[dict] = None  # 실제 응답 데이터 (성공 시 데이터, 실패 시 None)


class LogListResponse(LogResponse):
    """로그 목록 조회 응답 모델"""
    data: dict = {
        "logs": List[LogEntry],  # 로그 엔트리 배열 (현재 페이지의 로그들)
        "stats": LogStats,  # 로그 통계 정보 (레벨별 개수, 시간 범위 등)
        "pagination": dict  # 페이징 정보 (현재 페이지, 전체 페이지 수 등)
    }


class LogStatsResponse(LogResponse):
    """로그 통계 조회 응답 모델"""
    data: LogStats  # 로그 통계 정보 (레벨별 개수, 시간 범위 등)
